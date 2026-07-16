import { Stack } from "expo-router";

export default function ProgressLayout() {
  // A cross-fade is pure opacity — the transition reduced motion keeps.
  return <Stack screenOptions={{ headerShown: false, animation: "fade" }} />;
}
