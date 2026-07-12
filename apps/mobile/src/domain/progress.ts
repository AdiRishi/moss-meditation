import { addLocalDays, fromLocalDateKey, startOfLocalMonth, startOfLocalWeek, toLocalDateKey } from "./date-time";
import type { CompletedSession, Weekday } from "./meditation";

export type ProgressMode = "week" | "month";

export type ProgressBucket = {
  label: string;
  minutes: number;
  completed: boolean;
  dateKey: string;
};

export type ProgressSummary = {
  sessions: number;
  minutes: number;
  dayRhythm: number;
  buckets: ProgressBucket[];
};

const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"] as const;

function sessionsForRange(sessions: CompletedSession[], startMs: number, endMs: number) {
  return sessions.filter((session) => session.completedAtMs >= startMs && session.completedAtMs < endMs);
}

function minutesByDate(sessions: CompletedSession[]) {
  const totals = new Map<string, number>();
  for (const session of sessions) {
    totals.set(session.localDate, (totals.get(session.localDate) ?? 0) + Math.round(session.durationMs / 60_000));
  }
  return totals;
}

function sessionCountsByDate(sessions: CompletedSession[]) {
  const counts = new Map<string, number>();
  for (const session of sessions) {
    counts.set(session.localDate, (counts.get(session.localDate) ?? 0) + 1);
  }
  return counts;
}

export function calculateDayRhythm(
  sessions: CompletedSession[],
  selectedWeekdays: Weekday[],
  nowMs: number,
  sessionsPerDay = 1,
) {
  const sessionCounts = sessionCountsByDate(sessions);
  const completedDates = new Set(
    [...sessionCounts].filter(([, count]) => count >= sessionsPerDay).map(([dateKey]) => dateKey),
  );
  const intendedDays = new Set<number>(selectedWeekdays);
  let cursor = new Date(nowMs);
  cursor.setHours(0, 0, 0, 0);

  if (intendedDays.has(cursor.getDay()) && !completedDates.has(toLocalDateKey(cursor.getTime()))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  let rhythm = 0;
  for (let scannedDays = 0; scannedDays < 3660; scannedDays += 1) {
    if (!intendedDays.has(cursor.getDay())) {
      cursor.setDate(cursor.getDate() - 1);
      continue;
    }

    if (!completedDates.has(toLocalDateKey(cursor.getTime()))) {
      break;
    }

    rhythm += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return rhythm;
}

export function buildProgressSummary(
  sessions: CompletedSession[],
  selectedWeekdays: Weekday[],
  nowMs: number,
  mode: ProgressMode,
  sessionsPerDay = 1,
): ProgressSummary {
  const startMs = mode === "week" ? startOfLocalWeek(nowMs) : startOfLocalMonth(nowMs);
  const periodEnd = new Date(startMs);
  if (mode === "week") {
    periodEnd.setDate(periodEnd.getDate() + 7);
  } else {
    periodEnd.setMonth(periodEnd.getMonth() + 1);
  }

  const periodSessions = sessionsForRange(sessions, startMs, periodEnd.getTime());
  const totals = minutesByDate(periodSessions);
  const sessionCounts = sessionCountsByDate(periodSessions);
  const buckets: ProgressBucket[] = [];

  if (mode === "week") {
    for (let index = 0; index < 7; index += 1) {
      const dateKey = toLocalDateKey(addLocalDays(startMs, index));
      const minutes = totals.get(dateKey) ?? 0;
      buckets.push({
        label: WEEKDAY_LABELS[index],
        minutes,
        completed: (sessionCounts.get(dateKey) ?? 0) >= sessionsPerDay,
        dateKey,
      });
    }
  } else {
    const cursor = new Date(startMs);
    while (cursor.getTime() < periodEnd.getTime()) {
      const bucketStart = cursor.getTime();
      const bucketEnd = Math.min(addLocalDays(bucketStart, 7), periodEnd.getTime());
      const bucketSessions = sessionsForRange(periodSessions, bucketStart, bucketEnd);
      buckets.push({
        label: String(cursor.getDate()),
        minutes: bucketSessions.reduce((sum, session) => sum + Math.round(session.durationMs / 60_000), 0),
        completed: [...sessionCountsByDate(bucketSessions).values()].some((count) => count >= sessionsPerDay),
        dateKey: toLocalDateKey(bucketStart),
      });
      cursor.setDate(cursor.getDate() + 7);
    }
  }

  return {
    sessions: periodSessions.length,
    minutes: periodSessions.reduce((sum, session) => sum + Math.round(session.durationMs / 60_000), 0),
    dayRhythm: calculateDayRhythm(sessions, selectedWeekdays, nowMs, sessionsPerDay),
    buckets,
  };
}

export function completedDateKeys(sessions: CompletedSession[]) {
  return new Set(sessions.map((session) => session.localDate));
}

export function compareLocalDateKeys(left: string, right: string) {
  return fromLocalDateKey(left).getTime() - fromLocalDateKey(right).getTime();
}
