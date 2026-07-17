import { useSQLiteContext } from "expo-sqlite";
import { createContext, use, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AccessibilityInfo, AppState } from "react-native";
import { Uniwind } from "uniwind";

import type { MeditationStore } from "@/data/meditation-store";
import { SQLiteMeditationStore } from "@/data/sqlite-meditation-store";
import { createSessionId } from "@/domain/identifiers";
import {
  DEFAULT_PREFERENCES,
  type ActiveSession,
  type AppPreferences,
  type CompletedSession,
  type CompletionSound,
  type Feeling,
  type SessionDuration,
} from "@/domain/meditation";
import { projectSession } from "@/domain/session-timer";
import {
  DENIED_NOTIFICATION_PERMISSION,
  UNDETERMINED_NOTIFICATION_PERMISSION,
  localNotifications,
  type LocalNotificationPermission,
  type LocalNotifications,
} from "@/services/local-notifications";

export type Clock = {
  now(): number;
};

const systemClock: Clock = {
  now: Date.now,
};

type MeditationState = {
  isReady: boolean;
  error: Error | null;
  preferences: AppPreferences;
  activeSession: ActiveSession | null;
  completedSessions: CompletedSession[];
  pendingCompletion: CompletedSession | null;
  reducedMotion: boolean;
  notificationPermission: LocalNotificationPermission;
};

type ProviderState = Omit<MeditationState, "reducedMotion">;

type MeditationContextValue = MeditationState & {
  refresh(): Promise<boolean>;
  savePreferences(preferences: AppPreferences): Promise<void>;
  startSession(durationMinutes: SessionDuration, completionSound?: CompletionSound): Promise<ActiveSession>;
  pauseSession(): Promise<ActiveSession>;
  resumeSession(): Promise<ActiveSession>;
  completeSession(): Promise<CompletedSession | null>;
  abandonSession(): Promise<void>;
  setSessionFeeling(id: string, feeling: Feeling | null): Promise<void>;
  acknowledgeSession(id: string): Promise<void>;
  saveNotificationPreferences(
    preferences: AppPreferences,
    options?: { requestPermission?: boolean },
  ): Promise<NotificationPreferencesSaveResult>;
  resetAllData(): Promise<void>;
};

export type NotificationPreferencesSaveResult = {
  preferences: AppPreferences;
  permission: LocalNotificationPermission;
  scheduledCount: number;
  status: "disabled" | "no-scheduled-times" | "permission-denied" | "saved" | "sound-disabled" | "sync-failed";
};

const MeditationContext = createContext<MeditationContextValue | null>(null);

type MeditationProviderProps = {
  children: React.ReactNode;
  store: MeditationStore;
  clock?: Clock;
  notifications?: LocalNotifications;
};

function pendingCompletion(sessions: CompletedSession[]) {
  return sessions.find((session) => session.acknowledgedAtMs === null) ?? null;
}

function completedSessionState(completedSessions: CompletedSession[]) {
  return {
    completedSessions,
    pendingCompletion: pendingCompletion(completedSessions),
  };
}

function sessionCompletionNotification(session: ActiveSession | null, enabled: boolean, nowMs: number) {
  if (!enabled || !session || session.status !== "running") {
    return null;
  }

  return {
    sessionId: session.id,
    scheduledAtMs: nowMs + projectSession(session, nowMs).remainingMs,
    sound: session.completionSound,
  };
}

async function syncCompletionNotificationBestEffort(
  notifications: LocalNotifications | undefined,
  session: ActiveSession | null,
  enabled: boolean,
  nowMs: number,
) {
  if (notifications) {
    await notifications
      .syncSessionCompletion(sessionCompletionNotification(session, enabled, nowMs))
      .catch(() => undefined);
  }
}

async function loadMeditationSnapshot(
  store: MeditationStore,
  clock: Clock,
  notifications: LocalNotifications | undefined,
) {
  const [preferences, storedActiveSession] = await Promise.all([store.loadPreferences(), store.loadActiveSession()]);
  let activeSession = storedActiveSession;

  if (activeSession && projectSession(activeSession, clock.now()).isComplete) {
    await store.completeActiveSession(clock.now());
    activeSession = await store.loadActiveSession();
  }

  const [completedSessions, notificationPermission] = await Promise.all([
    store.listCompletedSessions(),
    notifications ? notifications.getPermission().catch(() => null) : Promise.resolve(null),
    syncCompletionNotificationBestEffort(
      notifications,
      activeSession,
      preferences.backgroundCompletionAlertsEnabled,
      clock.now(),
    ),
  ]);

  return { activeSession, completedSessions, notificationPermission, preferences };
}

export function MeditationProvider({ children, store, clock = systemClock, notifications }: MeditationProviderProps) {
  const stateRevision = useRef(0);
  const [systemReducedMotion, setSystemReducedMotion] = useState(false);
  const [state, setState] = useState<ProviderState>({
    isReady: false,
    error: null,
    preferences: DEFAULT_PREFERENCES,
    activeSession: null,
    completedSessions: [],
    pendingCompletion: null,
    notificationPermission: UNDETERMINED_NOTIFICATION_PERMISSION,
  });

  const invalidatePendingRefresh = useCallback(() => {
    stateRevision.current += 1;
  }, []);

  const commitState = useCallback(
    (changes: Partial<ProviderState>) => {
      invalidatePendingRefresh();
      setState((current) => ({ ...current, ...changes }));
    },
    [invalidatePendingRefresh],
  );

  const syncCompletionNotification = useCallback(
    async (session: ActiveSession | null, enabled: boolean, nowMs = clock.now()) => {
      await syncCompletionNotificationBestEffort(notifications, session, enabled, nowMs);
    },
    [clock, notifications],
  );

  const refresh = useCallback(
    async function convergeWithStoredMeditationState() {
      while (true) {
        const refreshRevision = stateRevision.current;
        try {
          const { activeSession, completedSessions, notificationPermission, preferences } =
            await loadMeditationSnapshot(store, clock, notifications);
          if (refreshRevision !== stateRevision.current) {
            continue;
          }
          setState((current) => ({
            isReady: true,
            error: null,
            preferences,
            activeSession,
            ...completedSessionState(completedSessions),
            notificationPermission: notificationPermission ?? current.notificationPermission,
          }));
          if (notifications) {
            void notifications.rescheduleWeeklyReminders(preferences).catch(() => undefined);
          }
          return true;
        } catch (error) {
          if (refreshRevision !== stateRevision.current) {
            continue;
          }
          setState((current) => ({
            ...current,
            isReady: true,
            error: error instanceof Error ? error : new Error("Local practice data is unavailable."),
          }));
          return false;
        }
      }
    },
    [clock, notifications, store],
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    void AccessibilityInfo.isReduceMotionEnabled().then(setSystemReducedMotion);
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setSystemReducedMotion);
    return () => subscription.remove();
  }, []);

  useEffect(() => {
    const subscription = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active") {
        void refresh();
      }
    });
    return () => subscription.remove();
  }, [refresh]);

  useEffect(() => {
    if (state.isReady) {
      Uniwind.setTheme(state.preferences.appearance);
    }
  }, [state.isReady, state.preferences.appearance]);

  const savePreferences = useCallback(
    async (preferences: AppPreferences) => {
      await store.savePreferences(preferences);
      commitState({ preferences });
    },
    [commitState, store],
  );

  const saveNotificationPreferences = useCallback(
    async (
      preferences: AppPreferences,
      { requestPermission = false }: { requestPermission?: boolean } = {},
    ): Promise<NotificationPreferencesSaveResult> => {
      const notificationsRequested = preferences.backgroundCompletionAlertsEnabled || preferences.remindersEnabled;
      let permission = state.notificationPermission;
      if (notificationsRequested && permission.status !== "granted" && permission.canAskAgain && requestPermission) {
        permission = notifications
          ? await notifications.requestPermission({
              completionSound: preferences.backgroundCompletionAlertsEnabled ? preferences.completionSound : undefined,
              reminders: preferences.remindersEnabled,
            })
          : DENIED_NOTIFICATION_PERMISSION;
      }

      await store.savePreferences(preferences);

      let schedulingResult;
      try {
        schedulingResult = notifications
          ? await notifications.rescheduleWeeklyReminders(preferences)
          : { permission: DENIED_NOTIFICATION_PERMISSION, scheduledCount: 0 };
        permission = schedulingResult.permission;
        await notifications?.syncSessionCompletion(
          sessionCompletionNotification(
            state.activeSession,
            preferences.backgroundCompletionAlertsEnabled,
            clock.now(),
          ),
        );
      } catch {
        commitState({
          preferences,
          notificationPermission: permission,
        });
        return { preferences, permission, scheduledCount: 0, status: "sync-failed" };
      }

      commitState({
        preferences,
        notificationPermission: permission,
      });

      const status = !notificationsRequested
        ? "disabled"
        : permission.status !== "granted"
          ? "permission-denied"
          : preferences.backgroundCompletionAlertsEnabled && !permission.allowsSound
            ? "sound-disabled"
            : preferences.remindersEnabled && schedulingResult.scheduledCount === 0
              ? "no-scheduled-times"
              : "saved";
      return {
        preferences,
        permission,
        scheduledCount: schedulingResult.scheduledCount,
        status,
      };
    },
    [clock, commitState, notifications, state.activeSession, state.notificationPermission, store],
  );

  const startSession = useCallback(
    async (durationMinutes: SessionDuration, completionSound?: CompletionSound) => {
      const nowMs = clock.now();
      const sound = completionSound ?? state.preferences.completionSound;
      const preferences: AppPreferences = {
        ...state.preferences,
        lastDurationMinutes: durationMinutes,
        completionSound: sound,
      };
      const session = await store.startSession({
        id: createSessionId(),
        durationMinutes,
        startedAtMs: nowMs,
        completionSound: sound,
        preferences,
      });
      commitState({ preferences, activeSession: session });
      await syncCompletionNotification(session, preferences.backgroundCompletionAlertsEnabled, nowMs);
      return session;
    },
    [clock, commitState, state.preferences, store, syncCompletionNotification],
  );

  const pauseActiveSession = useCallback(async () => {
    const session = await store.pauseActiveSession(clock.now());
    commitState({ activeSession: session });
    await syncCompletionNotification(null, false);
    return session;
  }, [clock, commitState, store, syncCompletionNotification]);

  const resumeActiveSession = useCallback(async () => {
    const nowMs = clock.now();
    const session = await store.resumeActiveSession(nowMs);
    commitState({ activeSession: session });
    await syncCompletionNotification(session, state.preferences.backgroundCompletionAlertsEnabled, nowMs);
    return session;
  }, [clock, commitState, state.preferences.backgroundCompletionAlertsEnabled, store, syncCompletionNotification]);

  const completeActiveSession = useCallback(async () => {
    const activeSessionId = state.activeSession?.id;
    const completed = await store.completeActiveSession(clock.now());
    await syncCompletionNotification(null, false);
    const completedSessions = await store.listCompletedSessions();
    commitState({
      activeSession: null,
      ...completedSessionState(completedSessions),
    });
    return completed ?? completedSessions.find((session) => session.id === activeSessionId) ?? null;
  }, [clock, commitState, state.activeSession?.id, store, syncCompletionNotification]);

  const abandonActiveSession = useCallback(async () => {
    await store.abandonActiveSession();
    await syncCompletionNotification(null, false);
    commitState({ activeSession: null });
  }, [commitState, store, syncCompletionNotification]);

  const setSessionFeeling = useCallback(
    async (id: string, feeling: Feeling | null) => {
      await store.updateSessionFeeling(id, feeling);
      const completedSessions = await store.listCompletedSessions();
      commitState(completedSessionState(completedSessions));
    },
    [commitState, store],
  );

  const acknowledgeSession = useCallback(
    async (id: string) => {
      await store.acknowledgeSession(id, clock.now());
      const completedSessions = await store.listCompletedSessions();
      commitState(completedSessionState(completedSessions));
    },
    [clock, commitState, store],
  );

  const resetAllData = useCallback(async () => {
    if (notifications) {
      await notifications.clearAllManagedNotifications();
    }
    await store.resetAllData();
    invalidatePendingRefresh();
    await refresh();
  }, [invalidatePendingRefresh, notifications, refresh, store]);

  const value: MeditationContextValue = {
    ...state,
    reducedMotion: state.preferences.reducedMotion || systemReducedMotion,
    refresh,
    savePreferences,
    startSession,
    pauseSession: pauseActiveSession,
    resumeSession: resumeActiveSession,
    completeSession: completeActiveSession,
    abandonSession: abandonActiveSession,
    setSessionFeeling,
    acknowledgeSession,
    saveNotificationPreferences,
    resetAllData,
  };

  return <MeditationContext value={value}>{children}</MeditationContext>;
}

export function SQLiteMeditationProvider({ children }: { children: React.ReactNode }) {
  const database = useSQLiteContext();
  const store = useMemo(() => new SQLiteMeditationStore(database), [database]);
  return (
    <MeditationProvider store={store} notifications={localNotifications}>
      {children}
    </MeditationProvider>
  );
}

export function useMeditation() {
  const context = use(MeditationContext);
  if (!context) {
    throw new Error("useMeditation must be used within MeditationProvider.");
  }
  return context;
}

/**
 * The reduced-motion flag for UI primitives that may render outside the
 * provider (design-system components, tests). Falls back to the system
 * setting when no provider is present.
 */
export function useReducedMotionPreference() {
  const context = use(MeditationContext);
  const [systemReducedMotion, setSystemReducedMotion] = useState(false);

  useEffect(() => {
    if (context) {
      return;
    }
    void AccessibilityInfo.isReduceMotionEnabled().then(setSystemReducedMotion);
    const subscription = AccessibilityInfo.addEventListener("reduceMotionChanged", setSystemReducedMotion);
    return () => subscription.remove();
  }, [context]);

  return context ? context.reducedMotion : systemReducedMotion;
}
