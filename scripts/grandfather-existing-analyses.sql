-- One-off backfill: analyses created before the paywall existed had no concept of a
-- "diagnostic" payment. Without this, canViewFullDiagnostic() would lock every
-- pre-existing analysis down to the teaser view for users who previously had full access.
-- This inserts a $0 "grandfathered" diagnostic payment for each such analysis so existing
-- users keep seeing what they already had.
INSERT INTO Payment (id, userId, kind, segment, amount, status, abacateBillingId, checkoutUrl, analysisId, paidAt, createdAt, updatedAt)
SELECT
  lower(hex(randomblob(16))),
  r.userId,
  'diagnostic',
  COALESCE(u.careerSegment, 'career_pro'),
  0,
  'paid',
  'grandfathered-' || a.id,
  '',
  a.id,
  a.createdAt,
  a.createdAt,
  a.createdAt
FROM Analysis a
JOIN Resume r ON r.id = a.resumeId
LEFT JOIN User u ON u.id = r.userId
WHERE r.userId IS NOT NULL
AND NOT EXISTS (
  SELECT 1 FROM Payment p WHERE p.analysisId = a.id AND p.kind = 'diagnostic' AND p.status = 'paid'
);
