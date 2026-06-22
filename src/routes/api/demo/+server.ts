import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";

/**
 * @swagger
 * /api/demo:
 *   get:
 *     summary: Get demo data
 *     description: Returns a success message and server timestamp.
 *     responses:
 *       200:
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/DemoResponse'
 */
export const GET: RequestHandler = async ({ locals }) => {
  return json({
    message: "Hello from Cloudflare Workers D1 + Better Auth!",
    timestamp: new Date().toISOString(),
    user: locals.user ? { name: locals.user.name, email: locals.user.email } : null,
  });
};
