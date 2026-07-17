import { fireEvent, waitFor } from "@testing-library/react-native";
import {
  createNotifications,
  notificationPermission,
  renderMeditationScreen,
} from "@tests/testing-utils/render-meditation-screen";

import { ReminderPermissionScreen } from "@/screens/onboarding/reminder-permission-screen";

const mockReplace = jest.fn();

jest.mock("expo-router", () => ({
  useRouter: () => ({ replace: mockReplace }),
}));

describe("ReminderPermissionScreen", () => {
  beforeEach(() => {
    mockReplace.mockClear();
  });

  it("finishes onboarding without requesting permission when both notification choices are off", async () => {
    const notifications = createNotifications("denied");
    notifications.rescheduleWeeklyReminders.mockRejectedValue(new Error("Notifications unavailable"));
    const { getByLabelText, getByText, store } = renderMeditationScreen(<ReminderPermissionScreen />, {
      notifications,
    });

    fireEvent(getByLabelText("Session completion"), "valueChange", false);
    fireEvent.press(getByText("Continue"));

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/(tabs)/today"));
    await expect(store.loadPreferences()).resolves.toMatchObject({
      onboardingCompleted: true,
      onboardingStep: "complete",
      backgroundCompletionAlertsEnabled: false,
      remindersEnabled: false,
    });
    expect(notifications.requestPermission).not.toHaveBeenCalled();
  });

  it("preserves both notification choices when the system permission is denied", async () => {
    const notifications = createNotifications("undetermined");
    const deniedPermission = notificationPermission("denied");
    notifications.requestPermission.mockResolvedValue(deniedPermission);
    notifications.rescheduleWeeklyReminders.mockResolvedValue({
      permission: deniedPermission,
      scheduledCount: 0,
    });
    const { getByLabelText, getByText, store } = renderMeditationScreen(<ReminderPermissionScreen />, {
      notifications,
    });

    fireEvent(getByLabelText("Practice reminders"), "valueChange", true);
    fireEvent.press(getByText("Continue"));

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/(tabs)/today"));
    await expect(store.loadPreferences()).resolves.toMatchObject({
      onboardingCompleted: true,
      backgroundCompletionAlertsEnabled: true,
      remindersEnabled: true,
    });
    expect(notifications.requestPermission).toHaveBeenCalledWith({
      completionSound: "soft-chime",
      reminders: true,
    });
  });

  it("preserves notification intent when native scheduling needs a retry", async () => {
    const notifications = createNotifications("undetermined");
    notifications.rescheduleWeeklyReminders.mockRejectedValueOnce(new Error("Scheduling unavailable"));
    const { getByLabelText, getByText, store } = renderMeditationScreen(<ReminderPermissionScreen />, {
      notifications,
    });

    fireEvent(getByLabelText("Practice reminders"), "valueChange", true);
    fireEvent.press(getByText("Continue"));

    await waitFor(() => expect(mockReplace).toHaveBeenCalledWith("/(tabs)/today"));
    await expect(store.loadPreferences()).resolves.toMatchObject({
      onboardingCompleted: true,
      backgroundCompletionAlertsEnabled: true,
      remindersEnabled: true,
    });
  });
});
