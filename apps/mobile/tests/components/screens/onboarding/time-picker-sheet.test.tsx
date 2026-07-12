import { fireEvent, waitFor } from "@testing-library/react-native";
import { renderWithSafeArea } from "@tests/screens/settings/test-utils";

import { AndroidTimePickerControl } from "@/components/screens/onboarding/android-time-picker-control";
import type { PracticeTime } from "@/domain/meditation";

jest.mock("@react-native-community/datetimepicker", () => {
  const React = jest.requireActual<typeof import("react")>("react");
  const { Pressable, Text } = jest.requireActual<typeof import("react-native")>("react-native");

  return {
    __esModule: true,
    default: ({ onChange, testID }: { onChange: (event: { type: string }, date: Date) => void; testID?: string }) =>
      React.createElement(
        Pressable,
        {
          testID,
          onPress: () => onChange({ type: "set" }, new Date(2026, 0, 1, 8, 35)),
        },
        React.createElement(Text, null, "Native time picker"),
      ),
  };
});

const PRACTICE_TIME: PracticeTime = {
  id: "morning",
  label: "Morning",
  hour: 7,
  minute: 0,
  enabled: true,
  reminderLeadMinutes: 10,
};

describe("TimePickerSheet on Android", () => {
  it("unmounts the native dialog after selection and lets the user reopen it", async () => {
    const onChange = jest.fn();
    const { getByTestId, getByText, queryByTestId } = renderWithSafeArea(
      <AndroidTimePickerControl practiceTime={PRACTICE_TIME} onChange={onChange} />,
    );

    await waitFor(() => getByTestId("onboarding.time-picker"));
    fireEvent.press(getByTestId("onboarding.time-picker"));

    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ hour: 8, minute: 35, enabled: true }));
    expect(queryByTestId("onboarding.time-picker")).toBeNull();

    fireEvent.press(getByText("Change time"));
    getByTestId("onboarding.time-picker");
  });
});
