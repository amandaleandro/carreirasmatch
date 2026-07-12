export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.BLOG_AUTOGEN_ENABLED === "false") return;

  const { startBlogScheduler } = await import("@/lib/blog-scheduler");
  startBlogScheduler();
}
