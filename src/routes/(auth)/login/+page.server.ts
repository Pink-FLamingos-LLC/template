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
  resendVerification: async (event) => {
    const { auth } = event.locals;
    const formData = await event.request.formData();
    const email = (formData.get("email") as string) ?? "";

    if (email) {
      try {
        await auth.api.sendVerificationEmail({
          body: { email, callbackURL: "/" },
        });
      } catch {
        // Silently ignore
      }
    }

    return { message: "Verification email sent!", email };
  },
  login: async (event) => {
    const { auth } = event.locals;
    const formData = await event.request.formData();
    const email = (formData.get("email") as string) ?? "";
    const password = (formData.get("password") as string) ?? "";
    const rememberMe = formData.get("rememberMe") === "on";

    try {
      await auth.api.signInEmail({
        body: { email, password, callbackURL: "/", rememberMe },
      });
    } catch (error) {
      if (error instanceof APIError) {
        return fail(400, { message: "Invalid credentials" });
      }
      return fail(500, { message: "Unexpected error" });
    }

    return redirect(302, "/");
  },
};
