import { fireEvent, waitFor } from "@testing-library/react-native";

import { AppearanceScreen } from "@/screens/appearance-screen";

import { renderMeditationScreen } from "./test-utils";

jest.mock("expo-router", () => ({
  useRouter: () => ({ back: jest.fn() }),
}));

describe("<AppearanceScreen />", () => {
  it("persists the chosen colour theme and reduced-motion preference", async () => {
    const { findByText, getByLabelText, store } = renderMeditationScreen(<AppearanceScreen />);

    await findByText("Colour theme");
    fireEvent.press(getByLabelText("Dark appearance"));
    await waitFor(async () => {
      await expect(store.loadPreferences()).resolves.toMatchObject({ appearance: "dark" });
    });

    fireEvent(getByLabelText("Reduced motion"), "valueChange", true);
    await waitFor(async () => {
      await expect(store.loadPreferences()).resolves.toMatchObject({ appearance: "dark", reducedMotion: true });
    });
  });
});
