import { fail, redirect } from "@sveltejs/kit";
import type { Actions } from "./$types";
import type { PageServerLoad } from "./$types";
import { APIError } from "better-auth/api";

export const load: PageServerLoad = (event) => {
  if (event.locals.user) {
    return redirect(302, "/");
  }
  return {};
};

export const actions: Actions = {
  default: async (event) => {
    const { auth } = event.locals;
    const formData = await event.request.formData();
    const email = (formData.get("email") as string) ?? "";

    try {
      await auth.api.requestPasswordReset({
        body: {
          email,
          redirectTo: `${event.url.origin}/reset-password`,
        },
      });
    } catch (error) {
      if (error instanceof APIError) {
        return fail(400, { message: error.message || "Request failed" });
      }
      return fail(500, { message: "Unexpected error" });
    }

    return { success: true, email };
  },
};
