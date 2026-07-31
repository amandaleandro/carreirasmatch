import { describe, expect, it } from "vitest";
import { COMMERCIAL_FEATURE_KEYS } from "@/lib/commercial-plan-catalog";
import {
  cancelFeatureUsage,
  confirmFeatureUsage,
  createUsageState,
  reserveFeatureUsage,
} from "@/lib/commercial-usage";

const feature = COMMERCIAL_FEATURE_KEYS.analysisFull;

describe("commercial usage reservations", () => {
  it("reserves and confirms usage exactly once", () => {
    const state = createUsageState();
    const first = reserveFeatureUsage(state, "pro", feature, 2, "event-1", () => "reservation-1");
    const repeated = reserveFeatureUsage(state, "pro", feature, 2, "event-1", () => "reservation-2");

    expect(first.ok).toBe(true);
    expect(repeated).toEqual(first);
    expect(state.snapshot).toEqual({ used: 0, reserved: 2 });

    confirmFeatureUsage(state, "reservation-1");
    confirmFeatureUsage(state, "reservation-1");
    expect(state.snapshot).toEqual({ used: 2, reserved: 0 });
  });

  it("blocks a reservation when confirmed plus pending usage crosses the limit", () => {
    const state = createUsageState(19, 0);
    const result = reserveFeatureUsage(state, "pro", feature, 2, "event-2", () => "reservation-2");

    expect(result).toEqual({
      ok: false,
      reason: "limit_reached",
      snapshot: { used: 19, reserved: 0 },
    });
  });

  it("releases a failed reservation without increasing confirmed usage", () => {
    const state = createUsageState();
    const result = reserveFeatureUsage(state, "pro", feature, 3, "event-3", () => "reservation-3");
    expect(result.ok).toBe(true);

    cancelFeatureUsage(state, "reservation-3");
    expect(state.snapshot).toEqual({ used: 0, reserved: 0 });
    expect(state.reservations.get("event-3")?.status).toBe("cancelled");
  });

  it("does not release or double-count a completed reservation", () => {
    const state = createUsageState();
    reserveFeatureUsage(state, "pro", feature, 1, "event-4", () => "reservation-4");
    confirmFeatureUsage(state, "reservation-4");
    cancelFeatureUsage(state, "reservation-4");

    expect(state.snapshot).toEqual({ used: 1, reserved: 0 });
    expect(state.reservations.get("event-4")?.status).toBe("confirmed");
  });
});

