import type { Instrumentation } from "next";
import * as Sentry from "@sentry/nextjs";
import { initSentry } from "@/lib/sentry-init";

export async function register() {
  initSentry("server");

  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  if (process.env.BLOG_AUTOGEN_ENABLED !== "false") {
    const { startBlogScheduler } = await import("@/lib/blog-scheduler");
    startBlogScheduler();
  }

  if (process.env.JOB_FEED_AUTOFETCH_ENABLED !== "false") {
    const { startJobFeedScheduler } = await import("@/lib/job-feed-scheduler");
    startJobFeedScheduler();
  }

  if (process.env.EXTERNAL_SOURCES_SYNC_ENABLED !== "false") {
    const { startExternalSourceScheduler } = await import("@/lib/external-source-scheduler");
    startExternalSourceScheduler();
  }

  if (process.env.LIFECYCLE_EMAILS_ENABLED !== "false") {
    const { startEmailScheduler } = await import("@/lib/email-scheduler");
    startEmailScheduler();
  }

  if (process.env.LIFECYCLE_WHATSAPP_ENABLED !== "false") {
    const { startWhatsappScheduler } = await import("@/lib/whatsapp-scheduler");
    startWhatsappScheduler();
  }

  // One-time backfill for jobs ingested before the job-tags migration.
  // Self-disabling: once every active job is tagged this becomes a no-op.
  try {
    const { countJobsNeedingTags, backfillJobTags, backfillContractTypeIfNeeded, backfillCityStateIfNeeded } =
      await import("@/lib/backfill-job-tags");
    if ((await countJobsNeedingTags()) > 0) {
      const result = await backfillJobTags();
      console.log(
        `[instrumentation] job tag backfill: scanned ${result.scanned}, updated ${result.updated}`,
      );
    }
    const contractTypeResult = await backfillContractTypeIfNeeded();
    if (contractTypeResult) {
      console.log(
        `[instrumentation] job contractType backfill: scanned ${contractTypeResult.scanned}, updated ${contractTypeResult.updated}`,
      );
    }
    const cityStateResult = await backfillCityStateIfNeeded();
    if (cityStateResult) {
      console.log(
        `[instrumentation] job city/state backfill: scanned ${cityStateResult.scanned}, updated ${cityStateResult.updated}`,
      );
    }
  } catch (err) {
    console.error("[instrumentation] job tag backfill failed", err);
  }
}

// Reporta erros de renderização/rotas server ao Sentry (no-op sem DSN).
export const onRequestError: Instrumentation.onRequestError = (...args) => {
  if (process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.captureRequestError(...args);
  }
};
