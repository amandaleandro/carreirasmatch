import { describe, expect, it } from "vitest";
import {
  calculateFreelanceCommissionCents,
  calculateFreelancerPayoutCents,
} from "./freelance";

describe("comissão do marketplace freelancer", () => {
  it("retém 5% e repassa 95% do serviço", () => {
    expect(calculateFreelanceCommissionCents(100_00)).toBe(500);
    expect(calculateFreelancerPayoutCents(100_00)).toBe(9_500);
  });

  it("arredonda em centavos e não gera valor negativo", () => {
    expect(calculateFreelanceCommissionCents(1)).toBe(0);
    expect(calculateFreelancerPayoutCents(1)).toBe(1);
  });
});
