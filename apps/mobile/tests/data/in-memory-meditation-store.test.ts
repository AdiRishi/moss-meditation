import { InMemoryMeditationStore } from "@/data/in-memory-meditation-store";
import { DEFAULT_PREFERENCES } from "@/domain/meditation";

const STARTED_AT = new Date(2026, 6, 13, 7, 0).getTime();

describe("MeditationStore", () => {
  it("completes an overdue active session exactly once", async () => {
    const store = new InMemoryMeditationStore();
    await store.startSession({
      id: "durable-session",
      durationMinutes: 5,
      startedAtMs: STARTED_AT,
      completionSound: "low-bowl",
      preferences: { ...DEFAULT_PREFERENCES, lastDurationMinutes: 5, completionSound: "low-bowl" },
    });

    const firstCompletion = await store.completeActiveSession(STARTED_AT + 5 * 60_000 + 10_000);
    const repeatedCompletion = await store.completeActiveSession(STARTED_AT + 6 * 60_000);

    expect(firstCompletion).toMatchObject({
      id: "durable-session",
      durationMs: 5 * 60_000,
      completionSound: "low-bowl",
    });
    expect(repeatedCompletion).toBeNull();
    await expect(store.listCompletedSessions()).resolves.toHaveLength(1);
    await expect(store.loadActiveSession()).resolves.toBeNull();
  });

  it("persists pause and resume transitions through its public interface", async () => {
    const store = new InMemoryMeditationStore();
    await store.startSession({
      id: "paused-session",
      durationMinutes: 10,
      startedAtMs: STARTED_AT,
      completionSound: "soft-chime",
      preferences: DEFAULT_PREFERENCES,
    });

    await store.pauseActiveSession(STARTED_AT + 2 * 60_000);
    const restoredPaused = await store.loadActiveSession();
    expect(restoredPaused).toMatchObject({
      status: "paused",
      accumulatedActiveMs: 2 * 60_000,
      resumedAtMs: null,
    });

    await store.resumeActiveSession(STARTED_AT + 7 * 60_000);
    await expect(store.loadActiveSession()).resolves.toMatchObject({
      status: "running",
      accumulatedActiveMs: 2 * 60_000,
      resumedAtMs: STARTED_AT + 7 * 60_000,
    });
  });

  it("keeps preferences unchanged when beginning a second session is rejected", async () => {
    const store = new InMemoryMeditationStore();
    await store.startSession({
      id: "first-session",
      durationMinutes: 5,
      startedAtMs: STARTED_AT,
      completionSound: "soft-chime",
      preferences: { ...DEFAULT_PREFERENCES, lastDurationMinutes: 5 },
    });

    await expect(
      store.startSession({
        id: "second-session",
        durationMinutes: 30,
        startedAtMs: STARTED_AT + 1_000,
        completionSound: "wood-tone",
        preferences: { ...DEFAULT_PREFERENCES, lastDurationMinutes: 30, completionSound: "wood-tone" },
      }),
    ).rejects.toThrow("already active");

    await expect(store.loadPreferences()).resolves.toMatchObject({
      lastDurationMinutes: 5,
      completionSound: "soft-chime",
    });
    await expect(store.loadActiveSession()).resolves.toMatchObject({ id: "first-session" });
  });
});
