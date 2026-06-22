<script lang="ts">
  import { page } from '$app/stores';

  let { children, data } = $props();
</script>

<svelte:head>
  <title>Starter App</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</svelte:head>

<div>
  <header>
    <div>
      <a href="/">
        <span>AppTemplate</span>
      </a>
    </div>
    <nav>
      {#if data.user}
        <span>Hello, {data.user.name}</span>
        <a href="/logout">Logout</a>
      {:else}
        <a href="/login">Login</a>
        <a href="/register">Get Started</a>
      {/if}
    </nav>
  </header>

  <main>
    {@render children()}
  </main>
</div>
