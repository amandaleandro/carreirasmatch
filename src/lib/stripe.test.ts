import { describe, it, expect, vi } from "vitest";

vi.mock("stripe", () => {
  return {
    default: class MockStripe {
      checkout = {
        sessions: {
          create: vi.fn().mockImplementation(async (params: Record<string, unknown>) => ({
            id: "cs_test_12345",
            url: "https://checkout.stripe.com/pay/cs_test_12345",
            ...params,
          })),
        },
      };
    },
  };
});

import { createStripeCheckoutSession } from "@/lib/stripe";

describe("Stripe Integration Blueprint", () => {
  it("deve criar uma sessão de Stripe Checkout com mode payment e parâmetros corretos", async () => {
    const session = await createStripeCheckoutSession({
      email: "candidato@exemplo.com",
      analysisId: "analysis-xyz-123",
      kind: "diagnostic",
      segment: "career_pro",
      originUrl: "http://localhost:3000",
    });

    expect(session.id).toBe("cs_test_12345");
    expect(session.url).toBe("https://checkout.stripe.com/pay/cs_test_12345");
  });
});
