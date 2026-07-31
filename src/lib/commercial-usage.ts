import {
  type CommercialFeatureKey,
  type CommercialPlanKey,
} from "@/lib/commercial-plan-catalog";
import { decideFeatureAccess } from "@/lib/commercial-plan-access";

export type UsageReservationStatus = "reserved" | "confirmed" | "cancelled";

export type UsageSnapshot = {
  used: number;
  reserved: number;
};

export type UsageReservation = {
  id: string;
  idempotencyKey: string;
  planKey: CommercialPlanKey | string;
  featureKey: CommercialFeatureKey;
  quantity: number;
  status: UsageReservationStatus;
};

export type ReservationResult =
  | { ok: true; reservation: UsageReservation; snapshot: UsageSnapshot }
  | { ok: false; reason: "invalid_quantity" | "limit_reached"; snapshot: UsageSnapshot };

export type UsageState = {
  snapshot: UsageSnapshot;
  reservations: Map<string, UsageReservation>;
};

export function createUsageState(used = 0, reserved = 0): UsageState {
  return {
    snapshot: {
      used: Number.isFinite(used) && used >= 0 ? Math.floor(used) : 0,
      reserved: Number.isFinite(reserved) && reserved >= 0 ? Math.floor(reserved) : 0,
    },
    reservations: new Map(),
  };
}

/** Reserva uso considerando consumo já confirmado e reservas ainda em andamento. */
export function reserveFeatureUsage(
  state: UsageState,
  planKey: CommercialPlanKey | string | null | undefined,
  featureKey: CommercialFeatureKey,
  quantity: number,
  idempotencyKey: string,
  createId: () => string,
): ReservationResult {
  const existing = state.reservations.get(idempotencyKey);
  if (existing) return { ok: true, reservation: existing, snapshot: state.snapshot };

  const decision = decideFeatureAccess(
    planKey,
    featureKey,
    state.snapshot.used + state.snapshot.reserved,
    quantity,
  );
  if (!decision.allowed) {
    return {
      ok: false,
      reason: decision.reason === "invalid_quantity" ? "invalid_quantity" : "limit_reached",
      snapshot: state.snapshot,
    };
  }

  const reservation: UsageReservation = {
    id: createId(),
    idempotencyKey,
    planKey: planKey || "free",
    featureKey,
    quantity: decision.requested,
    status: "reserved",
  };
  state.reservations.set(idempotencyKey, reservation);
  state.snapshot.reserved += reservation.quantity;
  return { ok: true, reservation, snapshot: state.snapshot };
}

export function confirmFeatureUsage(state: UsageState, reservationId: string): UsageReservation | null {
  const reservation = findReservation(state, reservationId);
  if (!reservation) return null;
  if (reservation.status !== "reserved") return reservation;

  reservation.status = "confirmed";
  state.snapshot.reserved = Math.max(0, state.snapshot.reserved - reservation.quantity);
  state.snapshot.used += reservation.quantity;
  return reservation;
}

export function cancelFeatureUsage(state: UsageState, reservationId: string): UsageReservation | null {
  const reservation = findReservation(state, reservationId);
  if (!reservation) return null;
  if (reservation.status !== "reserved") return reservation;

  reservation.status = "cancelled";
  state.snapshot.reserved = Math.max(0, state.snapshot.reserved - reservation.quantity);
  return reservation;
}

function findReservation(state: UsageState, reservationId: string): UsageReservation | null {
  for (const reservation of state.reservations.values()) {
    if (reservation.id === reservationId) return reservation;
  }
  return null;
}
