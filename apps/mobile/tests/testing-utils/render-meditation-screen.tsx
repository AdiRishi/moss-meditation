import { render } from "@testing-library/react-native";
import { InMemoryMeditationStore } from "@tests/testing-utils/in-memory-meditation-store";
import type { ReactElement } from "react";
import { type Metrics, SafeAreaProvider } from "react-native-safe-area-context";

import type { MeditationStore } from "@/data/meditation-store";
import { MeditationProvider } from "@/providers/meditation-provider";
import type {
  LocalNotificationPermission,
  LocalNotificationPermissionStatus,
  LocalNotifications,
  NotificationPermissionRequest,
  SessionCompletionNotification,
} from "@/services/local-notifications";

const SAFE_AREA_METRICS: Metrics = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, right: 0, bottom: 34, left: 0 },
};

export function renderWithSafeArea(ui: ReactElement) {
  return render(ui, {
    wrapper: ({ children }) => <SafeAreaProvider initialMetrics={SAFE_AREA_METRICS}>{children}</SafeAreaProvider>,
  });
}

export function renderMeditationScreen(
  ui: ReactElement,
  options: { store?: MeditationStore; notifications?: LocalNotifications } = {},
) {
  const store = options.store ?? new InMemoryMeditationStore();
  const result = renderWithSafeArea(
    <MeditationProvider store={store} notifications={options.notifications}>
      {ui}
    </MeditationProvider>,
  );

  return { ...result, store };
}

export function notificationPermission(
  status: LocalNotificationPermissionStatus,
  overrides: Partial<LocalNotificationPermission> = {},
): LocalNotificationPermission {
  const granted = status === "granted";
  return {
    status,
    canAskAgain: status === "undetermined",
    allowsAlert: granted,
    allowsSound: granted,
    ...overrides,
  };
}

export function createNotifications(
  initialPermission: LocalNotificationPermissionStatus | LocalNotificationPermission = "granted",
) {
  let permission =
    typeof initialPermission === "string" ? notificationPermission(initialPermission) : initialPermission;
  const notifications: jest.Mocked<LocalNotifications> = {
    getPermission: jest.fn(async () => permission),
    requestPermission: jest.fn(async (_request: NotificationPermissionRequest) => {
      permission = notificationPermission("granted");
      return permission;
    }),
    rescheduleWeeklyReminders: jest.fn(async (preferences) => ({
      permission,
      scheduledCount: permission.status === "granted" && preferences.remindersEnabled ? 1 : 0,
    })),
    syncSessionCompletion: jest.fn(async (_notification: SessionCompletionNotification | null) => true),
    clearAllManagedNotifications: jest.fn(async () => undefined),
  };
  return notifications;
}
