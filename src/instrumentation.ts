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
}

// Reporta erros de renderização/rotas server ao Sentry (no-op sem DSN).
export const onRequestError: Instrumentation.onRequestError = (...args) => {
  if (process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN) {
    Sentry.captureRequestError(...args);
  }
};
