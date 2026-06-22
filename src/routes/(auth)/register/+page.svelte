<script lang="ts">
  import { enhance } from '$app/forms';

  let { form } = $props();
  let loading = $state(false);
</script>

<div>
  <div>
    <div>
      <h2>Create Account</h2>
      <p>Sign up to start using the application template.</p>
    </div>

    {#if form?.message}
      <div>
        {form.message}
      </div>
    {/if}

    <form method="POST" use:enhance={() => {
      loading = true;
      return async ({ update }) => {
        loading = false;
        await update();
      };
    }}>
      <div>
        <label for="name">Full Name</label>
        <input
          type="text"
          id="name"
          name="name"
          placeholder="Jane Doe"
          required
        />
      </div>

      <div>
        <label for="email">Email Address</label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="jane@example.com"
          required
        />
      </div>

      <div>
        <label for="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          placeholder="At least 8 characters"
          required
        />
      </div>

      <div>
        <input type="checkbox" id="termsAccepted" name="termsAccepted" required />
        <label for="termsAccepted">I agree to the Terms and Privacy Policy</label>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Creating Account...' : 'Sign Up'}
      </button>
    </form>

    <div>
      Already have an account? <a href="/login">Sign in</a>
    </div>
  </div>
</div>
