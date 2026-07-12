import { Card } from "heroui-native";

export function ZenCard({ className, ...props }: React.ComponentProps<typeof Card>) {
  return (
    <Card
      className={`overflow-hidden rounded-[20px] border border-border bg-surface p-0 ${className ?? ""}`}
      {...props}
    />
  );
}
