import { Separator } from "heroui-native";
import { View } from "react-native";

import { Typography } from "@/components/ui/typography";
import { ZenCard } from "@/components/ui/zen/zen-card";
import { ZenIcon } from "@/components/ui/zen/zen-icon";
import { addLocalDays, fromLocalDateKey, toLocalDateKey } from "@/domain/date-time";
import type { CompletedSession } from "@/domain/meditation";
import { useThemeColors } from "@/hooks/use-theme-colors";

const SESSION_DATE_FORMATTER = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" });
const SESSION_TIME_FORMATTER = new Intl.DateTimeFormat(undefined, {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "UTC",
});

function sessionWallClockMs(session: CompletedSession) {
  return session.startedAtMs - session.timezoneOffsetMinutes * 60_000;
}

function sessionLabel(session: CompletedSession) {
  return new Date(sessionWallClockMs(session)).getUTCHours() < 12 ? "Morning" : "Evening";
}

function sessionDateTime(session: CompletedSession, nowMs: number) {
  const todayKey = toLocalDateKey(nowMs);
  const yesterdayKey = toLocalDateKey(addLocalDays(nowMs, -1));
  const dateLabel =
    session.localDate === todayKey
      ? "Today"
      : session.localDate === yesterdayKey
        ? "Yesterday"
        : SESSION_DATE_FORMATTER.format(fromLocalDateKey(session.localDate));

  return `${dateLabel}, ${SESSION_TIME_FORMATTER.format(sessionWallClockMs(session))}`;
}

function SessionRow({ session, nowMs }: { session: CompletedSession; nowMs: number }) {
  const colors = useThemeColors();
  const label = sessionLabel(session);
  const dateTime = sessionDateTime(session, nowMs);
  const durationMinutes = Math.round(session.durationMs / 60_000);

  return (
    <View
      accessible
      accessibilityLabel={`${label} session, ${dateTime}, ${durationMinutes} ${
        durationMinutes === 1 ? "minute" : "minutes"
      }`}
      className="min-h-18 flex-row items-center gap-3 px-4 py-3"
    >
      <View className="size-11 items-center justify-center rounded-full bg-surface-secondary">
        <ZenIcon name={label === "Morning" ? "sun" : "moon"} size={22} tintColor={colors.muted} />
      </View>
      <View className="min-w-0 flex-1 gap-0.5">
        <Typography variant="body">{label}</Typography>
        <Typography variant="small" tone="muted" tabularNums>
          {dateTime}
        </Typography>
      </View>
      <Typography variant="small" tone="muted" align="right" tabularNums>
        {durationMinutes} min
      </Typography>
    </View>
  );
}

export function SessionHistoryList({ sessions, nowMs }: { sessions: CompletedSession[]; nowMs: number }) {
  return (
    <ZenCard>
      {sessions.map((session, index) => (
        <View key={session.id}>
          {index > 0 ? <Separator /> : null}
          <SessionRow session={session} nowMs={nowMs} />
        </View>
      ))}
    </ZenCard>
  );
}
