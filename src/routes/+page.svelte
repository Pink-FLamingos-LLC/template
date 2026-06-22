<script lang="ts">
  import CaretRightIcon from 'phosphor-svelte/lib/CaretRightIcon';
  import ShieldCheckIcon from 'phosphor-svelte/lib/ShieldCheckIcon';
  import LightningIcon from 'phosphor-svelte/lib/LightningIcon';
  import DatabaseIcon from 'phosphor-svelte/lib/DatabaseIcon';

  let { data } = $props();
</script>

{#if data.user}
  <div>
    <header>
      <div>Starter Kit Dashboard</div>
      <h1>Welcome back, {data.user.name}!</h1>
      <p>Your Cloudflare D1 + Better Auth instance is fully operational.</p>
    </header>

    <div>
      <div>
        <div>
          <ShieldCheckIcon size={24} weight="fill" />
        </div>
        <h2>Authentication State</h2>
        <div>
          <p><strong>Email:</strong> {data.user.email}</p>
          <p><strong>Verified:</strong> {data.user.emailVerified ? 'Yes' : 'No'}</p>
          <p><strong>Role:</strong> {data.user.role}</p>
        </div>
      </div>

      <div>
        <div>
          <DatabaseIcon size={24} weight="fill" />
        </div>
        <h2>Drizzle D1 Database</h2>
        <p>D1 is configured and migration-ready. Better Auth tables have been initialized in your local SQLite/D1 instance.</p>
        <div>
          <a href="/api/demo" target="_blank">
            Test Demo API Endpoint <CaretRightIcon size={16} />
          </a>
        </div>
      </div>

      <div>
        <div>
          <LightningIcon size={24} weight="fill" />
        </div>
        <h2>Worker Integrations</h2>
        <p>Durable Objects, Outbound Message Queues, and Scheduled Cron tasks are ready to be integrated into your application workflow.</p>
      </div>
    </div>
  </div>
{:else}
  <div>
    <div>
      <div>SvelteKit + Cloudflare Worker Template</div>
      <h1>
        The Modern Stack for<br />
        <span>Cloudflare Workers</span>
      </h1>
      <p>
        Deploy a highly scalable, serverless web app equipped with Better Auth, Drizzle ORM, D1 SQLite database, Cron triggers, Queues, and Svelte 5 runes.
      </p>
      <div>
        <a href="/register">Create Account</a>
        <a href="/login">Sign In</a>
      </div>
    </div>
  </div>
{/if}
