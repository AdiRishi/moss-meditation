import { Separator } from "heroui-native";
import { View } from "react-native";

import { Typography } from "@/components/ui/typography";
import { ZenCard } from "@/components/ui/zen/zen-card";
import { ZenIcon } from "@/components/ui/zen/zen-icon";
import { formatLocalDateLabel, formatSessionDaypart, formatWallClockTime } from "@/domain/date-time";
import type { CompletedSession } from "@/domain/meditation";
import { useThemeColors } from "@/hooks/use-theme-colors";

function sessionLabel(session: CompletedSession) {
  return formatSessionDaypart(session.completedAtMs, session.timezoneOffsetMinutes);
}

function sessionDateTime(session: CompletedSession, nowMs: number) {
  return `${formatLocalDateLabel(session.localDate, nowMs)}, ${formatWallClockTime(
    session.completedAtMs,
    session.timezoneOffsetMinutes,
  )}`;
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
        <ZenIcon name={label === "Evening" ? "moon" : "sun"} size={22} tintColor={colors.muted} />
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
