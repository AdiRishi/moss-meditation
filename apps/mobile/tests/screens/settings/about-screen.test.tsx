import { AboutScreen } from "@/screens/about-screen";

import { renderWithSafeArea } from "./test-utils";

jest.mock("expo-router", () => ({
  useRouter: () => ({ back: jest.fn() }),
}));

describe("<AboutScreen />", () => {
  it("states Zen’s product promise and local app version", () => {
    const { getByText } = renderWithSafeArea(<AboutScreen />);

    getByText("A quiet rhythm for daily practice.");
    getByText("Support the practice without becoming the focus of it.");
    getByText(/^Version /);
  });
});
