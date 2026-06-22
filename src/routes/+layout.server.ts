import { redirect } from "@sveltejs/kit";
import type { LayoutServerLoad } from "./$types";

const AUTH_PATHS = new Set([
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/confirm-email",
]);

const PUBLIC_PATHS = new Set(["/", "/privacy", "/terms"]);

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true;
  return pathname.startsWith("/api/demo");
}

export const load: LayoutServerLoad = async ({ url, locals }) => {
  if (!locals.user && !AUTH_PATHS.has(url.pathname) && !isPublicPath(url.pathname)) {
    return redirect(302, "/login");
  }

  if (locals.user && AUTH_PATHS.has(url.pathname)) {
    return redirect(302, "/");
  }

  return {
    user: locals.user,
  };
};
