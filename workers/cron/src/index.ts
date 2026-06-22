interface Env {
  DB: D1Database;
}

export default {
  async scheduled(controller: ScheduledController, env: Env, ctx: ExecutionContext): Promise<void> {
    console.log(`[cron] Triggered at: ${new Date(controller.scheduledTime).toISOString()}`);
    // Example: query D1 database, process stats, clean up stale sessions, etc.
    try {
      const result = await env.DB.prepare("SELECT count(*) as count FROM user").first<{
        count: number;
      }>();
      console.log(`[cron] Total registered users in DB: ${result?.count ?? 0}`);
    } catch (err) {
      console.error("[cron] Failed to query database:", err);
    }
  },
};
