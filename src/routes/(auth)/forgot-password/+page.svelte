<script lang="ts">
  import { enhance } from '$app/forms';

  let { form } = $props();
  let loading = $state(false);
</script>

<div>
  <div>
    <div>
      <h2>Forgot Password</h2>
      <p>Enter your email address to receive a password reset link.</p>
    </div>

    {#if form?.success}
      <div>
        A password reset link has been sent to <strong>{form.email}</strong>. Please check your inbox.
      </div>
    {:else}
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
          <label for="email">Email Address</label>
          <input
            type="email"
            id="email"
            name="email"
            placeholder="you@example.com"
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? 'Sending link...' : 'Send Reset Link'}
        </button>
      </form>
    {/if}

    <div>
      Remembered your password? <a href="/login">Sign in</a>
    </div>
  </div>
</div>
