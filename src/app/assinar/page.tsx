import { PublicSubscriptionCheckout } from "@/components/public-subscription-checkout";
import { isCareerSegment, type CareerSegment } from "@/lib/career-segments";

export default async function SubscribePage({
  searchParams,
}: {
  searchParams: Promise<{ segment?: string }>;
}) {
  const params = await searchParams;
  const segment: CareerSegment = params.segment && isCareerSegment(params.segment) ? params.segment : "career_pro";

  return <PublicSubscriptionCheckout initialSegment={segment} />;
}
