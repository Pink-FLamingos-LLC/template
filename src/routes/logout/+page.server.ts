import { redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";

export const load: PageServerLoad = async (event) => {
  if (event.locals.auth) {
    try {
      await event.locals.auth.api.signOut({
        headers: event.request.headers,
      });
    } catch {
      // Ignore failure if already signed out
    }
  }
  return redirect(302, "/login");
};

export const actions = {
  default: async (event) => {
    if (event.locals.auth) {
      await event.locals.auth.api.signOut({
        headers: event.request.headers,
      });
    }
    return redirect(302, "/login");
  },
} satisfies Actions;
