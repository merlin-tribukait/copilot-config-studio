<script lang="ts">
  type Page = "setup" | "providers" | "settings";
  type Route = "github" | "local" | "hosted";

  let page = $state<Page>("setup");
  let draftRoute = $state<Route | null>(null);

  const routes: {
    id: Route;
    eyebrow: string;
    title: string;
    description: string;
    note: string;
    icon: string;
  }[] = [
    {
      id: "github",
      eyebrow: "COPILOT ACCOUNT",
      title: "GitHub Copilot",
      description: "Use model access available to your signed-in Copilot CLI account.",
      note: "Availability and limits depend on your account and organization policy.",
      icon: "GH"
    },
    {
      id: "local",
      eyebrow: "ON YOUR MACHINE",
      title: "Local model",
      description: "Connect Copilot CLI to a model server running locally or on your network.",
      note: "Usually no model API fee. Hardware use depends on where the server runs.",
      icon: "LO"
    },
    {
      id: "hosted",
      eyebrow: "EXTERNAL SERVICE",
      title: "Hosted provider",
      description: "Connect an OpenAI-compatible, Azure, or Anthropic provider.",
      note: "Prompts may leave your device. Provider billing is separate from GitHub.",
      icon: "API"
    }
  ];

  const pageTitles: Record<Page, string> = {
    setup: "Setup",
    providers: "Providers",
    settings: "CLI settings"
  };
</script>

<svelte:head>
  <title>Copilot Config Studio</title>
  <meta
    name="description"
    content="A clear, careful setup workbench for Copilot CLI model routes and settings."
  />
</svelte:head>

<div class="app-shell">
  <aside class="rail" aria-label="Main navigation">
    <div class="brand">
      <span class="brand-mark" aria-hidden="true"><span></span><span></span><span></span></span>
      <span class="brand-name">config<span>studio</span></span>
    </div>

    <div class="rail-label">WORKSPACE</div>
    <nav>
      <button class:active={page === "setup"} class="nav-item" aria-current={page === "setup" ? "page" : undefined} onclick={() => (page = "setup")}>
        <span class="nav-icon" aria-hidden="true">01</span>
        <span>Setup</span>
        {#if page === "setup"}<span class="active-dot" aria-hidden="true"></span>{/if}
      </button>
      <button class:active={page === "providers"} class="nav-item" aria-current={page === "providers" ? "page" : undefined} onclick={() => (page = "providers")}>
        <span class="nav-icon" aria-hidden="true">02</span>
        <span>Providers</span>
        {#if page === "providers"}<span class="active-dot" aria-hidden="true"></span>{/if}
      </button>
      <button class:active={page === "settings"} class="nav-item" aria-current={page === "settings" ? "page" : undefined} onclick={() => (page = "settings")}>
        <span class="nav-icon" aria-hidden="true">03</span>
        <span>CLI settings</span>
        {#if page === "settings"}<span class="active-dot" aria-hidden="true"></span>{/if}
      </button>
    </nav>

    <div class="rail-spacer"></div>
    <div class="rail-note">
      <span class="note-glyph" aria-hidden="true">i</span>
      <p>Setup choices stay local until you choose to apply or launch.</p>
    </div>
    <div class="rail-version">EARLY PREVIEW <span>·</span> 0.1</div>
  </aside>

  <main class="main-area">
    <header class="topbar">
      <div class="breadcrumb"><span>WORKSPACE</span><span class="crumb-slash">/</span>{pageTitles[page]}</div>
      <div class="topbar-status"><span class="status-ring"></span> CLI detection not connected</div>
    </header>

    {#if page === "setup"}
      <section class="content setup-content" aria-labelledby="page-title">
        <div class="intro">
          <div class="overline"><span class="overline-line"></span> COPILOT CLI · SETUP WORKSPACE</div>
          <h1 id="page-title">Choose your<br /><span>model route.</span></h1>
          <p class="intro-copy">
            Start with where your model runs. We’ll make the trade-offs clear before anything is saved or sent.
          </p>
        </div>

        <div class="environment-card">
          <div class="environment-symbol" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M4 7.5 12 3l8 4.5v9L12 21l-8-4.5v-9Z" stroke="currentColor" stroke-width="1.4" />
              <path d="m4.5 7.8 7.5 4.4 7.5-4.4M12 12.2V21" stroke="currentColor" stroke-width="1.4" />
            </svg>
          </div>
          <div class="environment-copy">
            <strong>Your environment</strong>
            <span>CLI detection is not connected; no settings have been read or changed.</span>
          </div>
          <span class="not-connected"><span></span> NOT CHECKED</span>
        </div>

        <div class="section-heading">
          <div>
            <h2>How should Copilot CLI use a model?</h2>
            <p>Choose a route to see the next setup step.</p>
          </div>
          <span class="step-count">CHOOSE ONE</span>
        </div>

        <div class="route-grid">
          {#each routes as route}
            <article class:chosen={draftRoute === route.id} class="route-card">
              <div class="card-topline">
                <span class="route-icon" aria-hidden="true">{route.icon}</span>
                {#if draftRoute === route.id}
                  <span class="draft-chip"><span></span> DRAFT</span>
                {/if}
              </div>
              <div class="route-copy">
                <div class="route-eyebrow">{route.eyebrow}</div>
                <h3>{route.title}</h3>
                <p>{route.description}</p>
              </div>
              <div class="route-note">{route.note}</div>
              <button
                class="route-action"
                class:route-action-selected={draftRoute === route.id}
                onclick={() => (draftRoute = route.id)}
                aria-pressed={draftRoute === route.id}
              >
                {draftRoute === route.id ? "Selected for setup" : "Choose this route"}
                <span aria-hidden="true">{draftRoute === route.id ? "✓" : "↗"}</span>
              </button>
            </article>
          {/each}
        </div>

        {#if draftRoute}
          <div class="draft-message" role="status">
            <span class="draft-message-icon" aria-hidden="true">✓</span>
            <p>
              <strong>{routes.find((route) => route.id === draftRoute)?.title} selected for this preview.</strong>
              This choice is held only in memory; no profile or settings were saved.
            </p>
            <button onclick={() => (page = draftRoute === "github" ? "settings" : "providers")}>
              View next step <span aria-hidden="true">→</span>
            </button>
          </div>
        {/if}

        <div class="privacy-strip">
          <span class="privacy-icon" aria-hidden="true">↗</span>
          <p>
            <strong>Know where your prompts go.</strong>
            Local models use your hardware. Hosted providers may receive prompts and context.
          </p>
          <a href="https://docs.github.com/en/copilot/how-tos/copilot-cli/customize-copilot/use-byok-models" target="_blank" rel="noreferrer">
            BYOK guide <span aria-hidden="true">↗</span>
          </a>
        </div>
      </section>
    {:else if page === "providers"}
      <section class="content secondary-content" aria-labelledby="page-title">
        <div class="overline"><span class="overline-line"></span> MODEL ROUTES</div>
        <h1 id="page-title">Provider <span>profiles.</span></h1>
        <p class="intro-copy">
          Keep provider details together and choose which route to use when you launch Copilot CLI.
        </p>
        <div class="feature-panel">
          <div class="panel-index">NEXT PHASE <span>01</span></div>
          <h2>Provider setup is not implemented yet.</h2>
          <p>
            This preview does not connect to endpoints, store credentials, or save profiles.
            When available, credentials should be stored in your operating system’s secure credential store.
          </p>
          <button class="secondary-button" onclick={() => (page = "setup")}>
            <span aria-hidden="true">←</span> Back to route choices
          </button>
        </div>
      </section>
    {:else}
      <section class="content secondary-content" aria-labelledby="page-title">
        <div class="overline"><span class="overline-line"></span> COPILOT CLI</div>
        <h1 id="page-title">Settings, <span>with care.</span></h1>
        <p class="intro-copy">
          Review supported CLI preferences without losing settings you already have.
        </p>
        <div class="feature-panel">
          <div class="panel-index">NEXT PHASE <span>02</span></div>
          <h2>Settings inspection is not connected yet.</h2>
          <p>
            No configuration files have been read or edited. The planned editor will validate changes,
            show a preview, create a backup, and preserve unrelated settings before applying.
          </p>
          <button class="secondary-button" onclick={() => (page = "setup")}>
            <span aria-hidden="true">←</span> Back to setup
          </button>
        </div>
      </section>
    {/if}

    <footer class="main-footer">
      <span>INDEPENDENT COMMUNITY PROJECT</span>
      <span class="footer-separator">·</span>
      <span>NOT AFFILIATED WITH GITHUB</span>
      <span class="footer-spacer"></span>
      <span class="footer-safe"><span></span> NO CHANGES MADE</span>
    </footer>
  </main>
</div>

<style>
  :global(*) { box-sizing: border-box; }
  :global(html) { min-width: 320px; min-height: 100%; background: #f4f6f9; color-scheme: light dark; }
  :global(body) {
    margin: 0;
    min-width: 320px;
    min-height: 100vh;
    color: #202a3a;
    font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
    font-size: 14px;
    -webkit-font-smoothing: antialiased;
  }
  :global(button), :global(a) { font: inherit; }
  :global(button:focus-visible), :global(a:focus-visible) {
    outline: 3px solid #7968eb;
    outline-offset: 3px;
  }

  .app-shell {
    --ink: #202a3a;
    --muted: #748093;
    --faint: #9ba5b3;
    --line: #e4e8ee;
    --surface: #ffffff;
    --canvas: #f4f6f9;
    --accent: #6958db;
    --accent-soft: #f1efff;
    --green: #27856b;
    min-height: 100vh;
    display: grid;
    grid-template-columns: 246px minmax(0, 1fr);
    background: var(--canvas);
  }
  .rail {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    padding: 27px 17px 19px;
    background: #fff;
    border-right: 1px solid var(--line);
  }
  .brand {
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 0 10px;
    color: var(--ink);
    text-decoration: none;
  }
  .brand-mark {
    width: 33px;
    height: 33px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 3px;
    border-radius: 10px;
    background: linear-gradient(145deg, #8171ed, #5947c7);
    box-shadow: 0 4px 10px #6958db33;
  }
  .brand-mark span { width: 3px; border-radius: 2px; background: #fff; }
  .brand-mark span:nth-child(1) { height: 9px; opacity: .7; }
  .brand-mark span:nth-child(2) { height: 16px; }
  .brand-mark span:nth-child(3) { height: 12px; opacity: .82; }
  .brand-name { font-size: 15px; font-weight: 720; letter-spacing: -.55px; }
  .brand-name span { display: block; margin-top: -2px; color: #8792a1; font-size: 9px; font-weight: 650; letter-spacing: 2.05px; text-transform: uppercase; }
  .rail-label { margin: 45px 12px 11px; color: #a2aab6; font-size: 9px; font-weight: 750; letter-spacing: 1.55px; }
  nav { display: grid; gap: 5px; }
  .nav-item {
    position: relative;
    width: 100%;
    min-height: 43px;
    display: flex;
    align-items: center;
    gap: 11px;
    padding: 0 12px;
    border: 0;
    border-radius: 8px;
    background: transparent;
    color: #697588;
    text-align: left;
    cursor: pointer;
    transition: background .16s ease, color .16s ease;
  }
  .nav-item:hover { background: #f6f7fa; color: var(--ink); }
  .nav-item.active { background: #f1efff; color: #5645c3; font-weight: 650; }
  .nav-icon { width: 22px; color: #a0aaba; font-family: ui-monospace, SFMono-Regular, monospace; font-size: 10px; }
  .nav-item.active .nav-icon { color: #7768db; }
  .active-dot { width: 5px; height: 5px; margin-left: auto; border-radius: 50%; background: var(--accent); }
  .rail-spacer { flex: 1; min-height: 40px; }
  .rail-note {
    display: flex;
    gap: 9px;
    padding: 13px 11px;
    border: 1px solid #eceef4;
    border-radius: 9px;
    background: #fafbfc;
  }
  .note-glyph { flex: 0 0 17px; width: 17px; height: 17px; border: 1px solid #a6afbc; border-radius: 50%; color: #778394; font-family: Georgia, serif; font-size: 12px; font-style: italic; line-height: 15px; text-align: center; }
  .rail-note p { margin: 0; color: #7e8999; font-size: 10px; line-height: 1.55; }
  .rail-version { padding: 19px 11px 0; color: #a6afbb; font-size: 8px; font-weight: 700; letter-spacing: 1.1px; }
  .rail-version span { margin: 0 4px; color: #ccd1d9; }

  .main-area { min-width: 0; min-height: 100vh; display: flex; flex-direction: column; }
  .topbar {
    height: 61px;
    flex: 0 0 61px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 clamp(22px, 4vw, 58px);
    border-bottom: 1px solid var(--line);
    background: rgba(255,255,255,.68);
  }
  .breadcrumb { color: #5b6678; font-size: 11px; font-weight: 600; }
  .breadcrumb > span:first-child { color: #9ba4b1; font-size: 9px; font-weight: 750; letter-spacing: 1.15px; }
  .crumb-slash { margin: 0 9px; color: #c3c9d2; }
  .topbar-status { display: flex; align-items: center; gap: 8px; color: #8b95a3; font-size: 10px; }
  .status-ring { width: 7px; height: 7px; border: 1.5px solid #b0b8c3; border-radius: 50%; }
  .content { width: min(1030px, 100%); margin: 0 auto; padding: 57px clamp(22px, 4vw, 58px) 28px; }
  .intro { max-width: 590px; }
  .overline { display: flex; align-items: center; gap: 9px; color: #8a94a3; font-size: 10px; font-weight: 750; letter-spacing: 1.35px; }
  .overline-line { width: 17px; height: 1px; background: #8a78e5; }
  h1 { margin: 17px 0 0; color: #273247; font-size: clamp(37px, 4.4vw, 53px); font-weight: 620; letter-spacing: -2.8px; line-height: 1.08; }
  h1 > span { color: #7565dc; }
  .intro-copy { max-width: 520px; margin: 17px 0 0; color: #788496; font-size: 13px; line-height: 1.75; }
  .environment-card {
    display: flex;
    align-items: center;
    gap: 13px;
    margin-top: 29px;
    padding: 13px 16px;
    border: 1px solid #e7eaf0;
    border-radius: 10px;
    background: rgba(255,255,255,.8);
  }
  .environment-symbol { width: 34px; height: 34px; display: grid; place-items: center; border-radius: 8px; background: #f3f2ff; color: #7565dc; }
  .environment-symbol svg { width: 19px; height: 19px; }
  .environment-copy { display: grid; gap: 3px; }
  .environment-copy strong { color: #364154; font-size: 11px; font-weight: 650; }
  .environment-copy span { color: #8a94a2; font-size: 10px; }
  .not-connected { display: flex; align-items: center; gap: 6px; margin-left: auto; color: #909aa8; font-size: 8px; font-weight: 750; letter-spacing: .95px; }
  .not-connected > span { width: 6px; height: 6px; border: 1px solid #adb6c2; border-radius: 50%; }
  .section-heading { display: flex; align-items: end; justify-content: space-between; margin: 42px 0 15px; }
  .section-heading h2 { margin: 0; color: #303b4f; font-size: 15px; font-weight: 680; letter-spacing: -.35px; }
  .section-heading p { margin: 5px 0 0; color: #919baa; font-size: 10px; }
  .step-count { color: #687386; font-family: ui-monospace, SFMono-Regular, monospace; font-size: 10px; font-weight: 650; }
  .route-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 12px; }
  .route-card {
    min-width: 0;
    min-height: 252px;
    display: flex;
    flex-direction: column;
    padding: 17px 16px 14px;
    border: 1px solid #e4e8ef;
    border-radius: 11px;
    background: #fff;
    box-shadow: 0 2px 6px #26345108;
    transition: border-color .16s ease, box-shadow .16s ease, transform .16s ease;
  }
  .route-card:hover { transform: translateY(-2px); border-color: #c9c3f2; box-shadow: 0 8px 20px #2634510d; }
  .route-card.chosen { border-color: #8879e7; box-shadow: 0 0 0 2px #7666de18, 0 5px 15px #2634510b; }
  .card-topline { display: flex; align-items: center; justify-content: space-between; min-height: 29px; }
  .route-icon { width: 29px; height: 29px; display: grid; place-items: center; border: 1px solid #e9ebf2; border-radius: 8px; background: #fafbfc; color: #727e90; font-family: ui-monospace, SFMono-Regular, monospace; font-size: 8px; font-weight: 750; letter-spacing: -.3px; }
  .route-card:nth-child(2) .route-icon { color: #32866e; background: #f1f8f5; border-color: #e2f0e9; }
  .route-card:nth-child(3) .route-icon { color: #6958d4; background: #f4f2ff; border-color: #ebe8ff; }
  .draft-chip { display: flex; align-items: center; gap: 5px; color: #6b5bd4; font-size: 8px; font-weight: 750; letter-spacing: .7px; }
  .draft-chip span { width: 5px; height: 5px; border-radius: 50%; background: #7666de; }
  .route-copy { margin-top: 20px; }
  .route-eyebrow { color: #9ba4b1; font-size: 8px; font-weight: 750; letter-spacing: 1.05px; }
  .route-copy h3 { margin: 7px 0 0; color: #303b4e; font-size: 15px; font-weight: 680; letter-spacing: -.35px; }
  .route-copy p { min-height: 50px; margin: 8px 0 0; color: #7b8798; font-size: 11px; line-height: 1.65; }
  .route-note { min-height: 39px; margin-top: auto; padding-top: 11px; border-top: 1px solid #eff1f4; color: #939dab; font-size: 10px; line-height: 1.5; }
  .route-action {
    min-height: 33px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-top: 10px;
    padding: 0 10px;
    border: 1px solid #e5e8ee;
    border-radius: 6px;
    background: #fff;
    color: #5d687a;
    font-size: 10px;
    font-weight: 620;
    cursor: pointer;
  }
  .route-action:hover { border-color: #b6afea; color: #5948c4; background: #fcfbff; }
  .route-action-selected { border-color: #d6d0fa; background: #f6f4ff; color: #5b4bc4; }
  .route-action > span { font-size: 13px; }
  .draft-message { display: flex; align-items: center; gap: 11px; margin-top: 13px; padding: 11px 13px; border: 1px solid #e4e0fb; border-radius: 8px; background: #f8f7ff; }
  .draft-message-icon { width: 18px; height: 18px; flex: 0 0 18px; display: grid; place-items: center; border-radius: 50%; background: #e9e5ff; color: #6554ce; font-size: 11px; }
  .draft-message p { flex: 1; margin: 0; color: #7a7890; font-size: 10px; line-height: 1.55; }
  .draft-message p strong { display: block; color: #4a426f; font-size: 11px; }
  .draft-message button { border: 0; background: transparent; color: #5d4dc4; font-size: 10px; font-weight: 650; white-space: nowrap; cursor: pointer; }
  .draft-message button span { margin-left: 5px; font-size: 12px; }
  .privacy-strip { display: flex; align-items: center; gap: 11px; margin-top: 17px; padding: 12px 14px; border: 1px solid #e6e9ee; border-radius: 8px; background: #f9fafb; }
  .privacy-icon { width: 20px; height: 20px; flex: 0 0 20px; display: grid; place-items: center; border-radius: 6px; background: #eef0f5; color: #6d788a; font-size: 12px; }
  .privacy-strip p { flex: 1; margin: 0; color: #8791a0; font-size: 10px; line-height: 1.5; }
  .privacy-strip p strong { margin-right: 5px; color: #566174; font-weight: 650; }
  .privacy-strip a { color: #6858d2; font-size: 10px; font-weight: 620; text-decoration: none; white-space: nowrap; }
  .privacy-strip a:hover { text-decoration: underline; }
  .privacy-strip a span { margin-left: 3px; }

  .secondary-content { padding-top: 76px; }
  .secondary-content .intro-copy { margin-top: 13px; }
  .feature-panel { max-width: 690px; margin-top: 38px; padding: 25px; border: 1px solid #e4e8ef; border-radius: 12px; background: #fff; box-shadow: 0 2px 8px #26345108; }
  .panel-index { display: flex; align-items: center; gap: 9px; color: #9aa3b0; font-size: 8px; font-weight: 750; letter-spacing: 1.15px; }
  .panel-index span { color: #7a6ade; font-family: ui-monospace, SFMono-Regular, monospace; }
  .feature-panel h2 { margin: 18px 0 0; color: #303b4f; font-size: 18px; font-weight: 680; letter-spacing: -.55px; }
  .feature-panel p { max-width: 540px; margin: 10px 0 0; color: #7c8798; font-size: 13px; line-height: 1.75; }
  .secondary-button { min-height: 36px; margin-top: 22px; padding: 0 12px; border: 1px solid #e4e7ed; border-radius: 7px; background: #fff; color: #5e697a; font-size: 10px; font-weight: 630; cursor: pointer; }
  .secondary-button:hover { border-color: #c7c1ef; color: #5e4cc7; background: #fcfbff; }
  .secondary-button span { margin-right: 5px; font-size: 13px; }
  .main-footer { width: min(1030px, 100%); min-height: 55px; display: flex; align-items: center; gap: 7px; margin: auto auto 0; padding: 15px clamp(22px, 4vw, 58px); color: #8994a2; font-size: 9px; font-weight: 700; letter-spacing: .65px; }
  .footer-separator { color: #c8cdd5; }
  .footer-spacer { flex: 1; }
  .footer-safe { display: flex; align-items: center; gap: 6px; color: #8b96a3; }
  .footer-safe span { width: 6px; height: 6px; border: 1px solid #aab4bf; border-radius: 50%; }

  @media (max-width: 920px) {
    .app-shell { grid-template-columns: 205px minmax(0, 1fr); }
    .route-grid { grid-template-columns: 1fr; }
    .route-card { min-height: auto; }
    .route-copy p { min-height: 0; }
    .route-note { margin-top: 13px; }
  }
  @media (max-width: 620px) {
    .app-shell { grid-template-columns: 1fr; }
    .rail { min-height: 0; padding: 12px 16px 10px; border-right: 0; border-bottom: 1px solid var(--line); }
    .brand { padding: 0 3px; }
    .brand-mark { width: 29px; height: 29px; }
    .brand-name { font-size: 13px; }
    .brand-name span { display: inline; margin-left: 6px; font-size: 8px; letter-spacing: 1.2px; }
    .rail-label, .rail-spacer, .rail-note, .rail-version { display: none; }
    nav { display: flex; gap: 4px; margin-top: 12px; }
    .nav-item { width: auto; min-height: 34px; gap: 6px; padding: 0 9px; font-size: 10px; }
    .nav-icon { display: none; }
    .active-dot { width: 4px; height: 4px; }
    .topbar { height: 46px; flex-basis: 46px; padding: 0 19px; }
    .topbar-status { font-size: 9px; }
    .content { padding: 37px 19px 22px; }
    h1 { font-size: 39px; letter-spacing: -2.1px; }
    .section-heading { margin-top: 31px; }
    .section-heading h2 { font-size: 13px; }
    .section-heading p { font-size: 9px; }
    .environment-card { align-items: flex-start; padding: 11px; }
    .environment-copy span { max-width: 205px; line-height: 1.45; }
    .not-connected { align-self: center; font-size: 7px; }
    .draft-message { flex-wrap: wrap; }
    .draft-message p { min-width: calc(100% - 36px); }
    .draft-message button { margin-left: 29px; }
    .privacy-strip { align-items: flex-start; flex-wrap: wrap; }
    .privacy-strip p { min-width: calc(100% - 35px); }
    .privacy-strip a { margin-left: 31px; }
    .secondary-content { padding-top: 48px; }
    .feature-panel { padding: 19px; }
    .main-footer { flex-wrap: wrap; gap: 5px; padding: 16px 19px; font-size: 8px; }
    .footer-spacer { flex-basis: 10px; }
    .footer-safe { margin-left: auto; }
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { scroll-behavior: auto !important; transition-duration: .01ms !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; }
  }
  @media (forced-colors: active) {
    .route-card, .environment-card, .feature-panel, .privacy-strip { border: 1px solid CanvasText; }
    .nav-item.active { outline: 1px solid Highlight; outline-offset: -1px; }
    :global(button:focus-visible), :global(a:focus-visible) { outline: 2px solid Highlight; }
    .draft-chip, .draft-message-icon, .route-action-selected { color: Highlight; }
  }
  @media (prefers-color-scheme: dark) {
    :global(html), .app-shell { --ink: #e5e8f0; --muted: #a1aabc; --faint: #798397; --line: #2a3040; --surface: #191e2a; --canvas: #131722; --accent: #a095ff; --accent-soft: #29243f; --green: #71c8a5; background: var(--canvas); color: var(--ink); }
    .rail, .topbar { background: #191e2a; border-color: #2a3040; }
    .brand, .section-heading h2, .route-copy h3, .feature-panel h2, .environment-copy strong { color: #e1e5ee; }
    .brand-name span, .intro-copy, .route-copy p, .feature-panel p, .environment-copy span { color: #9da7b8; }
    .nav-item { color: #a3adbd; }
    .nav-item:hover { background: #222838; color: #e5e8f0; }
    .nav-item.active { background: #29243f; color: #b2aaff; }
    .nav-item.active .nav-icon { color: #a095ff; }
    .rail-note, .environment-card, .route-card, .feature-panel { background: #191e2a; border-color: #2b3242; }
    .rail-note p, .route-note, .not-connected, .topbar-status, .section-heading p { color: #9aa5b6; }
    .environment-symbol, .route-card:nth-child(3) .route-icon { background: #29243f; border-color: #393253; color: #b2aaff; }
    .route-card:nth-child(2) .route-icon { background: #1d302d; border-color: #2d423d; color: #83c7aa; }
    .route-icon { background: #202635; border-color: #303747; color: #b0bacb; }
    .route-action, .secondary-button { background: #1b2130; border-color: #343b4c; color: #c4ccda; }
    .route-action:hover, .secondary-button:hover { background: #24233a; border-color: #655ba5; color: #c0b8ff; }
    .route-action-selected, .draft-message { background: #24213a; border-color: #4b426f; color: #c2baff; }
    .draft-message p { color: #aaa5c3; }
    .draft-message p strong { color: #ddd8ff; }
    .draft-message-icon { background: #393253; color: #c2baff; }
    .privacy-strip { background: #191e2a; border-color: #2b3242; }
    .privacy-strip p { color: #a1aabc; }
    .privacy-strip p strong { color: #d1d7e2; }
    .privacy-icon { background: #242b3a; color: #aab4c4; }
    .main-footer { color: #808b9e; }
    .route-note { border-color: #2b3242; }
    h1 { color: #e4e7ef; }
    .overline { color: #a3adbd; }
    .route-eyebrow, .panel-index { color: #8994a7; }
  }
</style>
