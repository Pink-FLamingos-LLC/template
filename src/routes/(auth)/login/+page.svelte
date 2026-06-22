<script lang="ts">
  import { enhance } from '$app/forms';

  let { form } = $props();
  let loading = $state(false);
</script>

<div>
  <div>
    <div>
      <h2>Welcome Back</h2>
      <p>Sign in to your starter application account.</p>
    </div>

    {#if form?.message}
      <div>
        {form.message}
      </div>
    {/if}

    <form method="POST" action="?/login" use:enhance={() => {
      loading = true;
      return async ({ update }) => {
        loading = false;
        await update();
      };
    }}>
      <div>
        <label for="email">Email Address</label>
        <input
          type="email"
          id="email"
          name="email"
          placeholder="you@example.com"
          value={form?.email ?? ''}
          required
        />
      </div>

      <div>
        <div>
          <label for="password">Password</label>
          <a href="/forgot-password">Forgot password?</a>
        </div>
        <input
          type="password"
          id="password"
          name="password"
          placeholder="••••••••"
          required
        />
      </div>

      <div>
        <input type="checkbox" id="rememberMe" name="rememberMe" checked />
        <label for="rememberMe">Remember me on this device</label>
      </div>

      <button type="submit" disabled={loading}>
        {loading ? 'Signing in...' : 'Sign In'}
      </button>
    </form>

    {#if form?.unverified}
      <div>
        <p>Didn't receive the verification email?</p>
        <form method="POST" action="?/resendVerification" use:enhance>
          <input type="hidden" name="email" value={form.email} />
          <button type="submit">Resend Verification Email</button>
        </form>
      </div>
    {/if}

    <div>
      Don't have an account? <a href="/register">Sign up</a>
    </div>
  </div>
</div>
