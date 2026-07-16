import { Typography } from "@/components/ui/typography";

export function AppVersionLabel({ version }: { version: string }) {
  return (
    <Typography variant="small" tone="muted" align="center" selectable>
      Version {version}
    </Typography>
  );
}
