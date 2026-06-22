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
    const name = (formData.get("name") as string) ?? "";
    const email = (formData.get("email") as string) ?? "";
    const password = (formData.get("password") as string) ?? "";
    const termsAccepted = formData.get("termsAccepted") !== null;

    if (!termsAccepted) {
      return fail(400, { message: "You must agree to the Terms of Service and Privacy Policy." });
    }

    try {
      await auth.api.signUpEmail({
        body: { name, email, password, callbackURL: "/" },
      });
    } catch (error) {
      if (error instanceof APIError) {
        return fail(400, { message: error.message || "Registration failed" });
      }
      return fail(500, { message: "Registration failed" });
    }

    return redirect(302, "/confirm-email");
  },
};
