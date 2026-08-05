import { checkFeatureAccess, resolveEffectivePlan } from "@/lib/feature-access";
import { COMMERCIAL_FEATURE_KEYS, FEATURE_LABELS, type CommercialFeatureKey } from "@/lib/commercial-plan-catalog";

export async function FeatureUsageSection({ userId }: { userId: string }) {
  await resolveEffectivePlan(userId);

  const featureKeys = Object.values(COMMERCIAL_FEATURE_KEYS) as CommercialFeatureKey[];
  const results = await Promise.all(
    featureKeys.map(async (featureKey) => ({
      featureKey,
      ...(await checkFeatureAccess(userId, featureKey)),
    }))
  );

  const visible = results.filter((r) => r.limit !== 0);
  if (visible.length === 0) return null;

  return (
    <div className="space-y-4">
      {visible.map(({ featureKey, used, limit }) => {
        const label = FEATURE_LABELS[featureKey];
        const unlimited = limit === null;
        const pct = unlimited ? 0 : Math.min(100, Math.round((used / Math.max(limit, 1)) * 100));

        return (
          <div key={featureKey} className="space-y-1.5">
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className="text-slate-700 dark:text-slate-300">{label}</span>
              <span className="font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                {unlimited ? "Ilimitado" : `${used}/${limit}`}
              </span>
            </div>
            {!unlimited && (
              <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    pct >= 100 ? "bg-red-500" : pct >= 80 ? "bg-amber-500" : "bg-blue-600"
                  }`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
