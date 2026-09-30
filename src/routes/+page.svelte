<script lang="ts">
  import { base } from "$app/paths";
  import { onMount, tick } from "svelte";
  import { buildGitHubFeedbackUrl, type FeedbackCategory } from "../lib/github-feedback";
  import { validateProviderDraft } from "../lib/provider-draft-validation";

  type Page = "about" | "setup" | "profiles" | "providers" | "appearance" | "settings";
  type Route = "github" | "local" | "hosted";
  type ProviderKind = "openai" | "azure" | "anthropic";
  type ProviderStep = "details" | "review" | "done";
  type Profile = { id: string; name: string; route: Route };
  type ColorTokens = {
    accent: string;
    accentSoft: string;
    canvas: string;
    surface: string;
    ink: string;
    muted: string;
    border: string;
  };
  type ColorProfile = { id: string; name: string; light: ColorTokens; dark: ColorTokens };
  type Workspace = {
    id: string;
    name: string;
    path: string;
    profileId: string | null;
    colorProfileId: string | null;
  };
  type IntegrationSource = "git" | "github" | "copilot" | "vscode";

  const isProjectWebsite = import.meta.env.VITE_GITHUB_PAGES === "true";
  let page = $state<Page>(isProjectWebsite ? "about" : "setup");
  let draftRoute = $state<Route | null>(null);
  let providerStep = $state<ProviderStep>("details");
  let providerKind = $state<ProviderKind>("openai");
  let providerName = $state("");
  let providerEndpoint = $state("");
  let providerModel = $state("");
  let formError = $state("");
  let appearanceMode = $state<"system" | "light" | "dark" | "dark-dimmed">("system");
  let systemDark = $state(false);
  let globalColorProfileId = $state("studio-violet");
  let previewWorkspaceId = $state("");
  let colorProfileNameDraft = $state("");
  let colorProfileError = $state("");
  let feedbackCategory = $state<FeedbackCategory>("bug");
  let feedbackTitle = $state("");
  let feedbackDetails = $state("");
  let feedbackArea = $state("Main content");
  let defaultProfileId = $state("personal");
  let profiles = $state<Profile[]>([{ id: "personal", name: "Personal default", route: "github" }]);
  let colorProfiles = $state<ColorProfile[]>([
    {
      id: "studio-violet",
      name: "Studio violet",
      light: { accent: "#6958db", accentSoft: "#f1efff", canvas: "#f4f6f9", surface: "#ffffff", ink: "#202a3a", muted: "#748093", border: "#e4e8ee" },
      dark: { accent: "#a095ff", accentSoft: "#29243f", canvas: "#131722", surface: "#191e2a", ink: "#e5e8f0", muted: "#a1aabc", border: "#2a3040" }
    },
    {
      id: "blue",
      name: "Blue",
      light: { accent: "#2878c7", accentSoft: "#eaf3fc", canvas: "#f4f6f9", surface: "#ffffff", ink: "#202a3a", muted: "#748093", border: "#e4e8ee" },
      dark: { accent: "#75baff", accentSoft: "#1d3045", canvas: "#131722", surface: "#191e2a", ink: "#e5e8f0", muted: "#a1aabc", border: "#2a3040" }
    },
    {
      id: "teal",
      name: "Teal",
      light: { accent: "#188477", accentSoft: "#e8f5f2", canvas: "#f4f6f9", surface: "#ffffff", ink: "#202a3a", muted: "#748093", border: "#e4e8ee" },
      dark: { accent: "#63c7b5", accentSoft: "#1d3534", canvas: "#131722", surface: "#191e2a", ink: "#e5e8f0", muted: "#a1aabc", border: "#2a3040" }
    },
    {
      id: "coral",
      name: "Coral",
      light: { accent: "#ca624f", accentSoft: "#fbefec", canvas: "#f4f6f9", surface: "#ffffff", ink: "#202a3a", muted: "#748093", border: "#e4e8ee" },
      dark: { accent: "#ff9c87", accentSoft: "#402a2c", canvas: "#131722", surface: "#191e2a", ink: "#e5e8f0", muted: "#a1aabc", border: "#2a3040" }
    }
  ]);
  let workspaces = $state<Workspace[]>([]);
  let activeDialog = $state<"profile" | "workspace" | "color-profile" | "feedback" | null>(null);
  let dialogElement: HTMLDialogElement;
  let profileNameDraft = $state("");
  let profileRouteDraft = $state<Route>("github");
  let workspaceNameDraft = $state("");
  let workspacePathDraft = $state("");
  let profileError = $state("");
  let workspaceError = $state("");
  let integrationSources = $state<Record<IntegrationSource, boolean>>({
    git: false,
    github: false,
    copilot: false,
    vscode: false
  });

  const providerKindLabels: Record<ProviderKind, string> = {
    openai: "OpenAI-compatible",
    azure: "Azure OpenAI",
    anthropic: "Anthropic"
  };

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
    about: "Project",
    setup: "Setup",
    profiles: "Profiles",
    providers: "Providers",
    appearance: "Appearance",
    settings: "CLI settings"
  };

  const feedbackAreas: Record<Page, string[]> = {
    about: ["Project overview", "Click dummy guide", "Project resources"],
    setup: ["Model route cards", "Environment status", "Data and cost notice"],
    profiles: ["Global default", "Workspace list", "Discovery sources"],
    providers: ["Provider details form", "Review step", "Finish step", "Provider list"],
    appearance: ["Theme mode", "Color profile editor", "Preview target"],
    settings: ["CLI settings placeholder"]
  };

  const routeLabels: Record<Route, string> = {
    github: "GitHub Copilot",
    local: "Local model",
    hosted: "Hosted provider"
  };

  const integrationSourceLabels: Record<IntegrationSource, string> = {
    git: "Git repositories",
    github: "GitHub CLI (gh)",
    copilot: "Copilot CLI",
    vscode: "Visual Studio Code"
  };

  const selectedDefaultProfile = $derived(
    profiles.find((profile) => profile.id === defaultProfileId) ?? profiles[0]
  );
  const previewWorkspace = $derived(
    workspaces.find((workspace) => workspace.id === previewWorkspaceId)
  );
  const selectedColorProfile = $derived(
    colorProfiles.find((profile) =>
      profile.id === (previewWorkspace?.colorProfileId ?? globalColorProfileId)
    ) ?? colorProfiles[0]
  );
  const effectiveTheme = $derived(
    appearanceMode === "system" ? (systemDark ? "dark" : "light") : appearanceMode === "light" ? "light" : "dark"
  );
  const activeColorTokens = $derived(
    effectiveTheme === "dark" ? selectedColorProfile.dark : selectedColorProfile.light
  );
  const themeStyle = $derived(
    `--accent: ${activeColorTokens.accent}; --accent-soft: ${activeColorTokens.accentSoft}; --canvas: ${activeColorTokens.canvas}; --surface: ${activeColorTokens.surface}; --ink: ${activeColorTokens.ink}; --muted: ${activeColorTokens.muted}; --line: ${activeColorTokens.border}; --focus-ring: ${activeColorTokens.accent}; color-scheme: ${effectiveTheme};`
  );
  const feedbackIssueUrl = $derived.by(() => {
    if (!feedbackTitle.trim() || !feedbackDetails.trim()) return "";
    return buildGitHubFeedbackUrl({
      category: feedbackCategory,
      title: feedbackTitle,
      details: feedbackDetails,
      page: pageTitles[page],
      area: feedbackArea,
      viewport: `${window.innerWidth}×${window.innerHeight}`
    });
  });

  onMount(() => {
    const preference = window.matchMedia("(prefers-color-scheme: dark)");
    const update = () => (systemDark = preference.matches);
    update();
    preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  });

  function openDialog(kind: "profile" | "workspace" | "color-profile") {
    activeDialog = kind;
    profileError = "";
    workspaceError = "";
    colorProfileError = "";
    if (kind === "color-profile") colorProfileNameDraft = "";
    void tick().then(() => dialogElement.showModal());
  }

  function openFeedbackDialog() {
    activeDialog = "feedback";
    feedbackCategory = "bug";
    feedbackTitle = "";
    feedbackDetails = "";
    feedbackArea = feedbackAreas[page][0] ?? "Main content";
    void tick().then(() => dialogElement.showModal());
  }

  function closeDialog() {
    dialogElement.close();
  }

  function createProfile() {
    const name = profileNameDraft.trim();
    if (!name) {
      profileError = "Enter a name for this profile.";
      return;
    }

    const id = crypto.randomUUID();
    profiles.push({ id, name, route: profileRouteDraft });
    profileNameDraft = "";
    profileError = "";
    closeDialog();
  }

  function createWorkspace() {
    const name = workspaceNameDraft.trim();
    const path = workspacePathDraft.trim();
    if (!name || !path) {
      workspaceError = "Enter a workspace name and folder path.";
      return;
    }
    if (/[\u0000-\u001f]/.test(path)) {
      workspaceError = "The folder path contains unsupported characters.";
      return;
    }

    workspaces.push({ id: crypto.randomUUID(), name, path, profileId: null, colorProfileId: null });
    workspaceNameDraft = "";
    workspacePathDraft = "";
    workspaceError = "";
    closeDialog();
  }

  function setWorkspaceProfile(workspaceId: string, profileId: string) {
    const workspace = workspaces.find((item) => item.id === workspaceId);
    if (workspace) workspace.profileId = profileId || null;
  }

  function setWorkspaceColorProfile(workspaceId: string, colorProfileId: string) {
    const workspace = workspaces.find((item) => item.id === workspaceId);
    if (workspace) workspace.colorProfileId = colorProfileId || null;
  }

  function setSelectedColorProfile(colorProfileId: string) {
    if (previewWorkspace) {
      previewWorkspace.colorProfileId = colorProfileId === globalColorProfileId ? null : colorProfileId;
    } else {
      globalColorProfileId = colorProfileId;
    }
  }

  function updateColorToken(token: keyof ColorTokens, value: string) {
    activeColorTokens[token] = value;
  }

  function createColorProfile() {
    const name = colorProfileNameDraft.trim();
    if (!name) {
      colorProfileError = "Enter a name for this color profile.";
      return;
    }

    const source = selectedColorProfile;
    const id = crypto.randomUUID();
    colorProfiles.push({
      id,
      name,
      light: { ...source.light },
      dark: { ...source.dark }
    });
    setSelectedColorProfile(id);
    colorProfileNameDraft = "";
    colorProfileError = "";
    closeDialog();
  }

  function toggleIntegrationSource(source: IntegrationSource) {
    integrationSources[source] = !integrationSources[source];
  }

  function startProviderSetup(route: "local" | "hosted") {
    draftRoute = route;
    providerStep = "details";
    providerKind = "openai";
    providerName = route === "local" ? "Local model" : "My provider";
    providerEndpoint = "";
    providerModel = "";
    formError = "";
    page = "providers";
  }

  function reviewProviderDraft() {
    formError = "";
    if (draftRoute !== "local" && draftRoute !== "hosted") {
      formError = "Choose a local or hosted route before continuing.";
      return;
    }

    const result = validateProviderDraft({
      route: draftRoute,
      name: providerName,
      endpoint: providerEndpoint,
      model: providerModel
    });
    if (!result.ok) {
      formError = result.error;
      return;
    }

    providerStep = "review";
  }

  function providerHost() {
    const result = validateProviderDraft({
      route: draftRoute === "hosted" ? "hosted" : "local",
      name: providerName,
      endpoint: providerEndpoint,
      model: providerModel
    });
    return result.ok ? result.host : "Invalid endpoint";
  }

  function finishProviderPreview() {
    providerStep = "done";
  }
</script>

<svelte:head>
  <title>{page === "about" ? "Copilot Config Studio — Project & interactive demo" : "Copilot Config Studio"}</title>
  <meta
    name="description"
    content="An independent, safety-first desktop concept for understanding Copilot CLI model routes, provider profiles, workspace defaults, and settings."
  />
  <meta property="og:title" content="Copilot Config Studio" />
  <meta property="og:description" content="Explore the documented interactive click dummy for a careful Copilot CLI setup workbench." />
  <meta property="og:type" content="website" />
  {#if isProjectWebsite}
    <meta property="og:url" content="https://merlin-tribukait.github.io/copilot-config-studio/" />
    <meta property="og:image" content="https://merlin-tribukait.github.io/copilot-config-studio/brand/app-icon.svg" />
    <meta name="twitter:card" content="summary" />
  {/if}
</svelte:head>

<div
  class:theme-dark={effectiveTheme === "dark"}
  class:theme-dimmed={appearanceMode === "dark-dimmed"}
  class="app-shell"
  data-appearance={appearanceMode}
  data-effective-theme={effectiveTheme}
  data-dimmed={appearanceMode === "dark-dimmed"}
  style={themeStyle}
>
  {#if isProjectWebsite}
    <a class="skip-link" href="#project-main">Skip to project content</a>
  {/if}
  <aside class="rail" aria-label="Main navigation">
    <div class="brand">
      <img class="brand-mark" src={`${base}/brand/app-icon.svg`} alt="" />
      <span class="brand-name">Copilot Config<span>STUDIO</span></span>
    </div>

    <div class="rail-label">WORKSPACE</div>
    <nav>
      <button class:active={page === "about"} class="nav-item" aria-current={page === "about" ? "page" : undefined} onclick={() => (page = "about")}>
        <span class="nav-icon" aria-hidden="true">00</span>
        <span>Project</span>
        {#if page === "about"}<span class="active-dot" aria-hidden="true"></span>{/if}
      </button>
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
      <button class:active={page === "profiles"} class="nav-item" aria-current={page === "profiles" ? "page" : undefined} onclick={() => (page = "profiles")}>
        <span class="nav-icon" aria-hidden="true">03</span>
        <span>Profiles</span>
        {#if page === "profiles"}<span class="active-dot" aria-hidden="true"></span>{/if}
      </button>
      <button class:active={page === "appearance"} class="nav-item" aria-current={page === "appearance" ? "page" : undefined} onclick={() => (page = "appearance")}>
        <span class="nav-icon" aria-hidden="true">04</span>
        <span>Appearance</span>
        {#if page === "appearance"}<span class="active-dot" aria-hidden="true"></span>{/if}
      </button>
      <button class:active={page === "settings"} class="nav-item" aria-current={page === "settings" ? "page" : undefined} onclick={() => (page = "settings")}>
        <span class="nav-icon" aria-hidden="true">05</span>
        <span>CLI settings</span>
        {#if page === "settings"}<span class="active-dot" aria-hidden="true"></span>{/if}
      </button>
    </nav>

    <div class="rail-spacer"></div>
    <div class="rail-note">
      <span class="note-glyph" aria-hidden="true">i</span>
      <p>Prototype values stay in page memory. Nothing is applied or saved.</p>
    </div>
    <div class="rail-version">EARLY PREVIEW <span>·</span> 0.1</div>
  </aside>

  <main id="project-main" class="main-area">
    <header class="topbar">
      <div class="breadcrumb"><span>WORKSPACE</span><span class="crumb-slash">/</span>{pageTitles[page]}</div>
      <div class="topbar-actions">
        <div class="topbar-status"><span class="status-ring"></span> Interactive concept · nothing saved</div>
        <button class="feedback-trigger" onclick={openFeedbackDialog}>Feedback <span aria-hidden="true">↗</span></button>
      </div>
    </header>

    {#if page === "about"}
      <section class="content secondary-content project-content" aria-labelledby="page-title">
        <div class="project-hero">
          <div class="overline"><span class="overline-line"></span> OPEN-SOURCE COMMUNITY CONCEPT</div>
          <h1 id="page-title">Copilot CLI setup,<br /><span>with clarity.</span></h1>
          <p class="project-lead">
            A calm, safety-first desktop workbench concept for model routes, provider profiles, workspace defaults, and Copilot CLI settings.
            Understand what would change—and where prompts would go—before taking action.
          </p>
          <div class="project-actions">
            <button class="primary-button" onclick={() => (page = "setup")}>Try the interactive click dummy <span aria-hidden="true">→</span></button>
            <a class="secondary-button" href="https://github.com/merlin-tribukait/copilot-config-studio" target="_blank" rel="noreferrer">View source on GitHub <span aria-hidden="true">↗</span></a>
          </div>
          <p class="project-disclaimer">Independent community project. Not affiliated with GitHub. This demo does not read your machine or configure Copilot CLI.</p>
        </div>

        <div class="project-feature-grid" aria-label="Project goals">
          <article class="project-feature">
            <span class="project-feature-index">01 / UNDERSTAND</span>
            <h2>Know the route</h2>
            <p>Compare GitHub-hosted Copilot, local models, and external providers without promising free usage or account access.</p>
          </article>
          <article class="project-feature">
            <span class="project-feature-index">02 / PROTECT</span>
            <h2>Make changes deliberate</h2>
            <p>Future configuration work is designed around clear previews, backups, safe credential storage, and explicit consent.</p>
          </article>
          <article class="project-feature">
            <span class="project-feature-index">03 / ADAPT</span>
            <h2>Fit each workspace</h2>
            <p>Explore global defaults, workspace overrides, and named appearance palettes in this non-persistent prototype.</p>
          </article>
        </div>

        <section class="project-guide" aria-labelledby="demo-guide-title">
          <div class="project-guide-heading">
            <div>
              <div class="panel-index">CLICK DUMMY GUIDE <span>READ BEFORE TESTING</span></div>
              <h2 id="demo-guide-title">What you can try</h2>
            </div>
            <button class="text-button" onclick={openFeedbackDialog}>Report an issue or idea <span aria-hidden="true">↗</span></button>
          </div>
          <ol class="demo-steps">
            <li><span>1</span><div><strong>Choose a model route</strong><p>On Setup, select GitHub Copilot, Local model, or Hosted provider. Only the latter two continue to the provider-form walkthrough.</p></div></li>
            <li><span>2</span><div><strong>Walk through provider setup</strong><p>Enter sample values to see local required-field and URL-format checks, then review and finish. Nothing connects, saves, or launches.</p></div></li>
            <li><span>3</span><div><strong>Preview defaults and workspace overrides</strong><p>On Profiles, create in-memory profiles/workspace entries and switch global or workspace-specific settings. Paths are never opened.</p></div></li>
            <li><span>4</span><div><strong>Personalize the appearance</strong><p>Choose a theme, create a named color profile, and adjust brand/focus, surfaces, text, and borders. Changes last only for this session.</p></div></li>
          </ol>
          <div class="demo-boundary">
            <strong>Prototype boundary</strong>
            <p>No CLI detection, file access, workspace discovery, provider requests, credentials, settings writes, or persistent storage are implemented. A green/local format check is not proof that a provider or model works.</p>
          </div>
        </section>

        <div class="project-resources">
          <a href="https://github.com/merlin-tribukait/copilot-config-studio/blob/main/docs/PRODUCT_UX_CONCEPT.md" target="_blank" rel="noreferrer">Product and UX concept <span>↗</span></a>
          <a href="https://github.com/merlin-tribukait/copilot-config-studio/blob/main/docs/IMPLEMENTATION_GUIDE.md" target="_blank" rel="noreferrer">Implementation and safety guide <span>↗</span></a>
          <a href="https://github.com/merlin-tribukait/copilot-config-studio/blob/main/CONTRIBUTING.md" target="_blank" rel="noreferrer">Contributing <span>↗</span></a>
        </div>
      </section>
    {:else if page === "setup"}
      <section class="content setup-content" aria-labelledby="page-title">
        <div class="intro">
          <div class="overline"><span class="overline-line"></span> COPILOT CLI · SETUP WORKSPACE</div>
          <h1 id="page-title">Choose a <span>model route.</span></h1>
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
            {#if draftRoute === "github"}
              <button onclick={() => (page = "settings")}>
                View next step <span aria-hidden="true">→</span>
              </button>
            {:else if draftRoute === "local" || draftRoute === "hosted"}
              <button onclick={() => startProviderSetup(draftRoute === "local" ? "local" : "hosted")}>
                Continue preview <span aria-hidden="true">→</span>
              </button>
            {/if}
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
      {#if draftRoute === "local" || draftRoute === "hosted"}
        <section class="content secondary-content" aria-labelledby="page-title">
          <div class="overline"><span class="overline-line"></span> INTERACTIVE CLICK DUMMY</div>
          <h1 id="page-title">{providerStep === "details" ? "Provider " : providerStep === "review" ? "Review the " : "Preview "}<span>{providerStep === "details" ? "draft." : providerStep === "review" ? "draft." : "complete."}</span></h1>
          <p class="intro-copy">
            A front-end walkthrough only. It does not check provider compatibility or change your Copilot CLI setup.
          </p>

          <div class="prototype-notice" role="note">
            <span aria-hidden="true">i</span>
            <p><strong>Nothing is saved or sent.</strong> Values stay in this page’s memory and disappear when it reloads. No credentials are collected.</p>
          </div>

          <ol class="wizard-steps" aria-label="Provider setup preview steps">
            <li class:current={providerStep === "details"} class:complete={providerStep !== "details"} aria-current={providerStep === "details" ? "step" : undefined}>1 <span>Details</span></li>
            <li class:current={providerStep === "review"} class:complete={providerStep === "done"} aria-current={providerStep === "review" ? "step" : undefined}>2 <span>Review</span></li>
            <li class:current={providerStep === "done"} aria-current={providerStep === "done" ? "step" : undefined}>3 <span>Finish</span></li>
          </ol>

          {#if providerStep === "details"}
            <form class="wizard-panel" onsubmit={(event) => { event.preventDefault(); reviewProviderDraft(); }}>
              <div class="panel-index">{draftRoute === "local" ? "LOCAL MODEL ROUTE" : "HOSTED PROVIDER ROUTE"} <span>01</span></div>
              <h2>Enter a draft profile</h2>
              <p class="form-intro">These fields are used only to demonstrate the review flow. Validation checks format only.</p>

              <label class="field">
                <span>Profile name</span>
                <input bind:value={providerName} maxlength="60" autocomplete="off" placeholder="My provider" required />
              </label>

              <label class="field">
                <span>Provider type</span>
                <select bind:value={providerKind}>
                  <option value="openai">OpenAI-compatible (Ollama, and others)</option>
                  {#if draftRoute === "hosted"}
                    <option value="azure">Azure OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                  {/if}
                </select>
                <small>No compatibility or model catalog lookup is performed.</small>
              </label>

              <label class="field">
                <span>Base URL</span>
                <input
                  bind:value={providerEndpoint}
                  type="url"
                  autocomplete="url"
                  placeholder={draftRoute === "local" ? "http://localhost:11434/v1" : "https://api.example.com/v1"}
                  required
                />
                <small>{draftRoute === "hosted" ? "HTTPS is required for hosted routes." : "HTTP is allowed for local endpoints in this preview."}</small>
              </label>

              <label class="field">
                <span>Model or deployment ID</span>
                <input bind:value={providerModel} maxlength="120" autocomplete="off" placeholder="Enter an ID manually" required />
                <small>There is no live model list in this prototype.</small>
              </label>

              <div class="credential-note"><strong>Credential field intentionally omitted.</strong> Never put a key in the URL.</div>

              {#if formError}
                <p class="form-error" role="alert">{formError}</p>
              {/if}

              <div class="wizard-actions">
                <button type="button" class="secondary-button" onclick={() => (page = "setup")}>Back to routes</button>
                <button type="submit" class="primary-button">Review draft <span aria-hidden="true">→</span></button>
              </div>
            </form>
          {:else if providerStep === "review"}
            <div class="wizard-panel">
              <div class="panel-index">LOCAL FORMAT CHECK ONLY <span>02</span></div>
              <h2>Review before finishing</h2>
              <p class="form-intro">Required fields and URL shape passed local checks. This does not verify connectivity, provider support, model access, or cost.</p>
              <dl class="review-list">
                <div><dt>Route</dt><dd>{draftRoute === "local" ? "Local model" : "Hosted provider"}</dd></div>
                <div><dt>Profile</dt><dd>{providerName.trim() || "Unnamed draft"}</dd></div>
                <div><dt>Provider type</dt><dd>{providerKindLabels[providerKind]}</dd></div>
                <div><dt>Endpoint host</dt><dd><code>{providerHost()}</code></dd></div>
                <div><dt>Model ID</dt><dd><code>{providerModel.trim()}</code></dd></div>
              </dl>
              <div class="review-warning"><strong>Not configured.</strong> No value has been written, no request made, and no CLI process started.</div>
              <div class="wizard-actions">
                <button class="secondary-button" onclick={() => { formError = ""; providerStep = "details"; }}>Edit draft</button>
                <button class="primary-button" onclick={finishProviderPreview}>Finish preview <span aria-hidden="true">→</span></button>
              </div>
            </div>
          {:else}
            <div class="wizard-panel completion-panel" role="status">
              <div class="completion-icon" aria-hidden="true">✓</div>
              <div class="panel-index">CLICK DUMMY COMPLETE <span>03</span></div>
              <h2>Preview complete</h2>
              <p class="form-intro">This only completes the walkthrough. Your draft was not saved, applied, or sent anywhere.</p>
              <div class="wizard-actions">
                <button class="secondary-button" onclick={() => (providerStep = "review")}>Back to review</button>
                <button class="primary-button" onclick={() => startProviderSetup(draftRoute === "hosted" ? "hosted" : "local")}>Start again</button>
              </div>
            </div>
          {/if}
        </section>
      {:else}
        <section class="content secondary-content" aria-labelledby="page-title">
          <div class="overline"><span class="overline-line"></span> MODEL ROUTES</div>
          <h1 id="page-title">Provider <span>profiles.</span></h1>
          <p class="intro-copy">Try the non-persistent provider profile walkthrough. No account, endpoint, or local configuration is accessed.</p>
          <div class="feature-panel">
            <div class="panel-index">CLICK DUMMY <span>01</span></div>
            <h2>Choose a setup preview</h2>
            <p>The interactive prototype checks required fields and URL format locally, then shows a review screen. It does not connect to an endpoint or save a profile.</p>
            <div class="wizard-actions">
              <button class="secondary-button" onclick={() => startProviderSetup("local")}>Preview local setup</button>
              <button class="primary-button" onclick={() => startProviderSetup("hosted")}>Preview hosted setup</button>
            </div>
          </div>
          <button class="secondary-button back-link" onclick={() => (page = "setup")}><span aria-hidden="true">←</span> Back to route choices</button>
        </section>
      {/if}
    {:else if page === "profiles"}
                <section class="content secondary-content profiles-content" aria-labelledby="page-title">
                  <div class="overline"><span class="overline-line"></span> GLOBAL DEFAULTS & WORKSPACES</div>
                  <div class="page-heading-row">
                    <div>
                      <h1 id="page-title">Profiles <span>that travel.</span></h1>
                      <p class="intro-copy">Set a global default, then give a workspace its own override when it needs one.</p>
                    </div>
                    <button class="primary-button" onclick={() => openDialog("profile")}>New profile <span aria-hidden="true">＋</span></button>
                  </div>

                  <div class="prototype-notice" role="note">
                    <span aria-hidden="true">i</span>
                    <p><strong>Prototype only.</strong> Profiles and workspace entries live in memory. No local files are scanned or changed.</p>
                  </div>

                  <div class="profile-columns">
                    <div class="profile-main-column">
                      <section class="settings-panel" aria-labelledby="global-default-heading">
                        <div class="panel-index">GLOBAL DEFAULT <span>01</span></div>
                        <h2 id="global-default-heading">Starting point for new workspaces</h2>
                        <p class="panel-description">Used unless a workspace has a profile override.</p>
                        <label class="field">
                          <span>Default profile</span>
                          <select bind:value={defaultProfileId}>
                            {#each profiles as profile}
                              <option value={profile.id}>{profile.name}</option>
                            {/each}
                          </select>
                        </label>
                        {#if selectedDefaultProfile}
                          <div class="profile-summary">
                            <span class="route-icon" aria-hidden="true">{selectedDefaultProfile.route === "github" ? "GH" : selectedDefaultProfile.route === "local" ? "LO" : "API"}</span>
                            <span><strong>{selectedDefaultProfile.name}</strong><small>{routeLabels[selectedDefaultProfile.route]}</small></span>
                            <span class="draft-chip"><span></span> IN MEMORY</span>
                          </div>
                        {/if}
                      </section>

                      <section class="settings-panel workspace-panel" aria-labelledby="workspace-heading">
                        <div class="workspace-panel-heading">
                          <div>
                            <div class="panel-index">PROJECT-SPECIFIC OVERRIDES <span>02</span></div>
                            <h2 id="workspace-heading">Workspaces <span class="count-chip">{workspaces.length}</span></h2>
                          </div>
                          <button class="secondary-button compact-button" onclick={() => openDialog("workspace")}>Add workspace</button>
                        </div>

                        {#if workspaces.length === 0}
                          <div class="empty-workspaces">
                            <span class="empty-workspace-icon" aria-hidden="true">⌂</span>
                            <div>
                              <strong>No workspaces added</strong>
                              <p>Add a workspace path to preview profile inheritance. Automatic discovery is not connected.</p>
                            </div>
                          </div>
                        {:else}
                          <div class="workspace-list">
                            {#each workspaces as workspace (workspace.id)}
                              <article class="workspace-row">
                                <div class="workspace-identity">
                                  <span class="workspace-glyph" aria-hidden="true">⌂</span>
                                  <span><strong>{workspace.name}</strong><code>{workspace.path}</code></span>
                                </div>
                                <label class="field workspace-profile-field">
                                  <span>Profile</span>
                                  <select
                                    value={workspace.profileId ?? ""}
                                    aria-label={`Profile for ${workspace.name}`}
                                    onchange={(event) => setWorkspaceProfile(workspace.id, event.currentTarget.value)}
                                  >
                                    <option value="">Inherit global · {selectedDefaultProfile?.name ?? "None"}</option>
                                    {#each profiles as profile}
                                      <option value={profile.id}>{profile.name}</option>
                                    {/each}
                                  </select>
                                </label>
                                <label class="field workspace-profile-field workspace-colors-field">
                                  <span>Color profile</span>
                                  <select
                                    value={workspace.colorProfileId ?? ""}
                                    aria-label={`Color profile for ${workspace.name}`}
                                    onchange={(event) => setWorkspaceColorProfile(workspace.id, event.currentTarget.value)}
                                  >
                                    <option value="">Inherit global · {colorProfiles.find((profile) => profile.id === globalColorProfileId)?.name ?? "Default"}</option>
                                    {#each colorProfiles as colorProfile}
                                      <option value={colorProfile.id}>{colorProfile.name}</option>
                                    {/each}
                                  </select>
                                </label>
                                <span class="inheritance-note">
                                  {workspace.profileId ? "Workspace profile" : "Inherits global"} ·
                                  {workspace.colorProfileId ? colorProfiles.find((profile) => profile.id === workspace.colorProfileId)?.name ?? "Custom colors" : "Global colors"}
                                </span>
                              </article>
                            {/each}
                          </div>
                        {/if}
                      </section>
                    </div>

                    <details class="discovery-panel">
                      <summary aria-labelledby="discovery-heading">
                        <div class="panel-index">OPTIONAL, USER-CONTROLLED <span>03</span></div>
                        <h2 id="discovery-heading">Discovery sources</h2>
                        <p class="panel-description">Choose which integrations a future version may check. Selection here does not inspect your device.</p>
                        <span class="discovery-expand">Configure sources <span aria-hidden="true">⌄</span></span>
                      </summary>
                      <div class="discovery-options">
                      <div class="source-list">
                        {#each Object.entries(integrationSourceLabels) as [source, label]}
                          {@const sourceId = source as IntegrationSource}
                          <button
                            class:source-selected={integrationSources[sourceId]}
                            class="source-option"
                            aria-pressed={integrationSources[sourceId]}
                            onclick={() => toggleIntegrationSource(sourceId)}
                          >
                            <span class="source-check" aria-hidden="true">{integrationSources[sourceId] ? "✓" : ""}</span>
                            <span><strong>{label}</strong><small>{integrationSources[sourceId] ? "Selected · not scanned" : "Not selected"}</small></span>
                          </button>
                        {/each}
                      </div>
                      <div class="discovery-footnote">
                        <strong>No credentials or code.</strong>
                        Planned discovery reads only the locations and metadata you approve. Account access must use official sign-in or CLI flows.
                      </div>
                      </div>
                    </details>
                  </div>
                </section>
    {:else if page === "appearance"}
                <section class="content secondary-content appearance-content" aria-labelledby="page-title">
                  <div class="overline"><span class="overline-line"></span> PERSONALIZE YOUR WORKBENCH</div>
                  <div class="page-heading-row">
                    <div>
                      <h1 id="page-title">Make it <span>yours.</span></h1>
                      <p class="intro-copy">Set a global palette, tune color groups, and preview workspace-specific color profiles.</p>
                    </div>
                  </div>

                  <div class="prototype-notice" role="note">
                    <span aria-hidden="true">i</span>
                    <p><strong>Preview preference.</strong> Appearance choices apply to this session only and reset when the app reloads.</p>
                  </div>

                  <section class="settings-panel appearance-panel" aria-labelledby="theme-heading">
                    <div class="panel-index">THEME <span>01</span></div>
                    <h2 id="theme-heading">Color mode</h2>
                    <p class="panel-description">Follow your operating system or choose a mode for this workbench.</p>
                    <div class="theme-options" role="group" aria-label="Color mode">
                      {#each [
                        { id: "system", label: "System", note: "Follow device" },
                        { id: "light", label: "Light", note: "Bright surfaces" },
                        { id: "dark", label: "Dark", note: "Low-light work" },
                        { id: "dark-dimmed", label: "Dark Dimmed", note: "Softer contrast" }
                      ] as option}
                        <button
                          class:theme-option-selected={appearanceMode === option.id}
                          class="theme-option"
                          aria-pressed={appearanceMode === option.id}
                          onclick={() => (appearanceMode = option.id as typeof appearanceMode)}
                        >
                          <span class={`theme-swatch theme-swatch-${option.id}`} aria-hidden="true"><i></i><i></i><i></i></span>
                          <strong>{option.label}</strong>
                          <small>{option.note}</small>
                        </button>
                      {/each}
                    </div>
                  </section>

                  <section class="settings-panel palette-panel" aria-labelledby="palette-heading">
                    <div class="palette-panel-heading">
                      <div>
                        <div class="panel-index">COLOR PROFILE <span>02</span></div>
                        <h2 id="palette-heading">{previewWorkspace ? `Preview · ${previewWorkspace.name}` : "Global appearance"}</h2>
                      </div>
                      <button class="secondary-button compact-button" onclick={() => openDialog("color-profile")}>New color profile</button>
                    </div>
                    <div class="palette-selectors">
                      <label class="field">
                        <span>Preview target</span>
                        <select bind:value={previewWorkspaceId}>
                          <option value="">Global default</option>
                          {#each workspaces as workspace (workspace.id)}
                            <option value={workspace.id}>{workspace.name}</option>
                          {/each}
                        </select>
                      </label>
                      <label class="field">
                        <span>{previewWorkspace ? "Workspace color profile" : "Global color profile"}</span>
                        <select
                          value={selectedColorProfile.id}
                          onchange={(event) => setSelectedColorProfile(event.currentTarget.value)}
                        >
                          {#each colorProfiles as colorProfile (colorProfile.id)}
                            <option value={colorProfile.id}>{colorProfile.name}</option>
                          {/each}
                        </select>
                      </label>
                    </div>
                    {#if previewWorkspace && !previewWorkspace.colorProfileId}
                      <p class="palette-inheritance-note">This workspace inherits the global profile. Choosing another profile here creates a workspace override.</p>
                    {/if}
                    <label class="field color-profile-name">
                      <span>Profile name</span>
                      <input bind:value={selectedColorProfile.name} maxlength="48" aria-label="Color profile name" />
                    </label>
                    <p class="panel-description">Edit the <strong>{effectiveTheme}</strong> palette. Theme mode and palette colors are independent; colors apply across navigation, panels, text, borders, controls, and focus.</p>
                    <div class="color-groups">
                      <fieldset class="color-group">
                        <legend>Brand & focus</legend>
                        <label class="color-field"><span>Action / focus</span><input type="color" value={activeColorTokens.accent} oninput={(event) => updateColorToken("accent", event.currentTarget.value)} /></label>
                        <label class="color-field"><span>Selected surface</span><input type="color" value={activeColorTokens.accentSoft} oninput={(event) => updateColorToken("accentSoft", event.currentTarget.value)} /></label>
                      </fieldset>
                      <fieldset class="color-group">
                        <legend>Surfaces</legend>
                        <label class="color-field"><span>Window canvas</span><input type="color" value={activeColorTokens.canvas} oninput={(event) => updateColorToken("canvas", event.currentTarget.value)} /></label>
                        <label class="color-field"><span>Panels & controls</span><input type="color" value={activeColorTokens.surface} oninput={(event) => updateColorToken("surface", event.currentTarget.value)} /></label>
                      </fieldset>
                      <fieldset class="color-group">
                        <legend>Text & edges</legend>
                        <label class="color-field"><span>Primary text</span><input type="color" value={activeColorTokens.ink} oninput={(event) => updateColorToken("ink", event.currentTarget.value)} /></label>
                        <label class="color-field"><span>Secondary text</span><input type="color" value={activeColorTokens.muted} oninput={(event) => updateColorToken("muted", event.currentTarget.value)} /></label>
                        <label class="color-field"><span>Borders</span><input type="color" value={activeColorTokens.border} oninput={(event) => updateColorToken("border", event.currentTarget.value)} /></label>
                      </fieldset>
                    </div>
                  </section>

                  <div class="appearance-preview" aria-live="polite">
                    <div><span class="preview-dot"></span><span><strong>Live preview · {selectedColorProfile.name}</strong><small>{previewWorkspace ? previewWorkspace.name : "Global default"} · {appearanceMode === "system" ? "following your device" : appearanceMode}</small></span></div>
                    <button class="primary-button">Example action</button>
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

  <dialog class="setup-dialog" bind:this={dialogElement} onclose={() => (activeDialog = null)}>
    {#if activeDialog === "profile"}
      <form onsubmit={(event) => { event.preventDefault(); createProfile(); }}>
        <div class="panel-index">NEW CONFIGURATION PROFILE <span>IN MEMORY</span></div>
        <h2>Create a profile</h2>
        <p class="panel-description">Profiles group the route and settings you intend to use. This draft is not saved or applied.</p>
        <label class="field">
          <span>Profile name</span>
          <input bind:value={profileNameDraft} maxlength="60" autocomplete="off" placeholder="e.g. Local development" required />
        </label>
        <label class="field">
          <span>Starting model route</span>
          <select bind:value={profileRouteDraft}>
            {#each routes as route}
              <option value={route.id}>{route.title}</option>
            {/each}
          </select>
        </label>
        {#if profileError}<p class="form-error" role="alert">{profileError}</p>{/if}
        <div class="wizard-actions">
          <button type="button" class="secondary-button" onclick={closeDialog}>Cancel</button>
          <button type="submit" class="primary-button">Create draft</button>
        </div>
      </form>
    {:else if activeDialog === "workspace"}
      <form onsubmit={(event) => { event.preventDefault(); createWorkspace(); }}>
        <div class="panel-index">ADD WORKSPACE DRAFT <span>IN MEMORY</span></div>
        <h2>Add a workspace</h2>
        <p class="panel-description">Enter a display name and path to preview profile inheritance. This does not browse or verify the folder.</p>
        <label class="field">
          <span>Workspace name</span>
          <input bind:value={workspaceNameDraft} maxlength="80" autocomplete="off" placeholder="e.g. Website redesign" required />
        </label>
        <label class="field">
          <span>Folder path (draft only)</span>
          <input bind:value={workspacePathDraft} maxlength="240" autocomplete="off" placeholder="/home/you/projects/example" required />
          <small>The path is not checked, opened, or saved to disk.</small>
        </label>
        {#if workspaceError}<p class="form-error" role="alert">{workspaceError}</p>{/if}
        <div class="wizard-actions">
          <button type="button" class="secondary-button" onclick={closeDialog}>Cancel</button>
          <button type="submit" class="primary-button">Add draft</button>
        </div>
      </form>
    {:else if activeDialog === "color-profile"}
      <form onsubmit={(event) => { event.preventDefault(); createColorProfile(); }}>
        <div class="panel-index">NEW APPEARANCE PROFILE <span>IN MEMORY</span></div>
        <h2>Create a color profile</h2>
        <p class="panel-description">Start from “{selectedColorProfile.name}”. The new named profile can be customized and assigned to any workspace.</p>
        <label class="field">
          <span>Color profile name</span>
          <input bind:value={colorProfileNameDraft} maxlength="48" autocomplete="off" placeholder="e.g. Client workspace" required />
        </label>
        {#if colorProfileError}<p class="form-error" role="alert">{colorProfileError}</p>{/if}
        <div class="wizard-actions">
          <button type="button" class="secondary-button" onclick={closeDialog}>Cancel</button>
          <button type="submit" class="primary-button">Create color profile</button>
        </div>
      </form>
    {:else if activeDialog === "feedback"}
      <form class="feedback-form" onsubmit={(event) => event.preventDefault()}>
        <div class="panel-index">COMMUNITY FEEDBACK <span>OPENS GITHUB</span></div>
        <h2>Help improve the project</h2>
        <p class="panel-description">We’ll prepare an issue draft in GitHub so you can review it and submit it yourself.</p>
        <label class="field">
          <span>Feedback type</span>
          <select bind:value={feedbackCategory}>
            <option value="bug">Something is broken</option>
            <option value="feature">Feature request</option>
            <option value="usability">Usability / design feedback</option>
            <option value="question">Question</option>
          </select>
        </label>
        <label class="field">
          <span>Short title</span>
          <input bind:value={feedbackTitle} maxlength="160" autocomplete="off" placeholder="What should we look at?" required />
        </label>
        <label class="field">
          <span>Details</span>
          <textarea bind:value={feedbackDetails} maxlength="5000" rows="5" placeholder="What happened, or what would you like to see?" required></textarea>
        </label>
        <label class="field">
          <span>Location in the click dummy</span>
          <select bind:value={feedbackArea}>
            {#each feedbackAreas[page] as area}
              <option value={area}>{area}</option>
            {/each}
          </select>
        </label>
        <div class="feedback-context">
          <strong>Context added to the draft</strong>
          <span>{pageTitles[page]} · {feedbackArea} · {typeof window === "undefined" ? "web view" : `${window.innerWidth}×${window.innerHeight}`}</span>
          <small>Your feedback text is included when you open the draft. No app configuration values, workspace paths, provider URLs, prompts, credentials, or device files are read or attached.</small>
        </div>
        <p class="feedback-privacy">Do not include secrets, personal data, private repository paths, or prompt contents. Opening the draft sends its title and description to GitHub; you review and submit it there. For a security report, use <a href="https://github.com/merlin-tribukait/copilot-config-studio/security/advisories/new" target="_blank" rel="noreferrer">private vulnerability reporting</a>. GitHub sign-in is required.</p>
        <div class="wizard-actions">
          <button type="button" class="secondary-button" onclick={closeDialog}>Cancel</button>
          <a
            class:feedback-link-disabled={!feedbackIssueUrl}
            class="primary-button feedback-submit-link"
            href={feedbackIssueUrl || undefined}
            target="_blank"
            rel="noopener noreferrer"
            aria-disabled={!feedbackIssueUrl}
          >Review issue on GitHub <span aria-hidden="true">↗</span></a>
        </div>
      </form>
    {/if}
  </dialog>
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
    flex: 0 0 33px;
    display: block;
    border-radius: 9px;
  }
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
  .page-heading-row { display: flex; align-items: end; justify-content: space-between; gap: 18px; margin-top: 6px; }
  .page-heading-row h1 { margin-top: 8px; }
  .page-heading-row .intro-copy { margin-top: 8px; }
  .page-heading-row > .primary-button { flex: 0 0 auto; margin-bottom: 3px; }
  .profile-columns { display: grid; grid-template-columns: minmax(0, 1.35fr) minmax(220px, .8fr); gap: 13px; margin-top: 15px; align-items: start; }
  .profile-main-column { display: grid; gap: 11px; min-width: 0; }
  .settings-panel, .discovery-panel { min-width: 0; padding: 17px 18px; border: 1px solid var(--line); border-radius: 10px; background: var(--surface); box-shadow: 0 2px 6px #26345108; }
  .settings-panel h2, .discovery-panel h2 { margin: 9px 0 0; color: var(--ink); font-size: 14px; font-weight: 680; letter-spacing: -.3px; }
  .panel-description { margin: 5px 0 0; color: var(--muted); font-size: 10px; line-height: 1.5; }
  .profile-main-column .field { margin-top: 10px; }
  .profile-summary { display: flex; align-items: center; gap: 9px; margin-top: 10px; padding-top: 9px; border-top: 1px solid var(--line); }
  .profile-summary > span:nth-child(2), .workspace-identity > span:last-child { display: grid; gap: 3px; min-width: 0; }
  .profile-summary strong, .workspace-identity strong { overflow: hidden; color: var(--ink); font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
  .profile-summary small { color: var(--muted); font-size: 9px; }
  .profile-summary .draft-chip { margin-left: auto; white-space: nowrap; }
  .workspace-panel { padding-bottom: 9px; }
  .workspace-panel-heading { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .workspace-panel-heading h2 { display: flex; align-items: center; gap: 8px; }
  .count-chip { min-width: 19px; height: 19px; display: inline-grid; place-items: center; border-radius: 10px; background: var(--accent-soft); color: var(--accent); font-family: ui-monospace, SFMono-Regular, monospace; font-size: 9px; }
  .compact-button { min-height: 30px; margin: 0; padding: 0 9px; font-size: 9px; white-space: nowrap; }
  .empty-workspaces { display: flex; align-items: center; gap: 9px; margin-top: 13px; padding: 10px; border: 1px dashed var(--line); border-radius: 7px; }
  .empty-workspace-icon { width: 25px; height: 25px; flex: 0 0 25px; display: grid; place-items: center; border-radius: 7px; background: var(--accent-soft); color: var(--accent); font-size: 15px; }
  .empty-workspaces strong { color: var(--ink); font-size: 10px; }
  .empty-workspaces p { margin: 3px 0 0; color: var(--muted); font-size: 9px; line-height: 1.45; }
  .workspace-list { display: grid; gap: 6px; max-height: 175px; margin-top: 10px; overflow: auto; }
  .workspace-row { display: grid; grid-template-columns: minmax(0, 1fr) minmax(125px, .75fr); gap: 5px 10px; align-items: center; padding: 8px 9px; border: 1px solid var(--line); border-radius: 7px; }
  .workspace-identity { display: flex; align-items: center; gap: 7px; min-width: 0; }
  .workspace-glyph { width: 22px; height: 22px; flex: 0 0 22px; display: grid; place-items: center; border-radius: 6px; background: #eff3f8; color: #617089; }
  .workspace-identity code { overflow: hidden; color: var(--muted); font-family: ui-monospace, SFMono-Regular, monospace; font-size: 8px; text-overflow: ellipsis; white-space: nowrap; }
  .workspace-profile-field { gap: 3px; margin: 0; font-size: 8px; }
  .workspace-profile-field select { min-height: 29px; padding: 0 6px; font-size: 9px; }
  .inheritance-note { grid-column: 2; color: var(--faint); font-size: 8px; text-align: right; }
  .discovery-panel { align-self: start; padding: 0; overflow: hidden; }
  .discovery-panel summary { position: relative; padding: 17px 18px; list-style: none; cursor: pointer; }
  .discovery-panel summary::-webkit-details-marker { display: none; }
  .discovery-expand { display: flex; justify-content: space-between; margin-top: 10px; padding-top: 8px; border-top: 1px solid var(--line); color: var(--accent); font-size: 9px; font-weight: 650; }
  .discovery-panel[open] .discovery-expand > span { transform: rotate(180deg); }
  .discovery-options { padding: 0 18px 15px; }
  .source-list { display: grid; gap: 5px; }
  .source-option { width: 100%; display: flex; align-items: center; gap: 8px; padding: 7px 8px; border: 1px solid var(--line); border-radius: 6px; background: var(--surface); color: var(--ink); text-align: left; cursor: pointer; }
  .source-option:hover, .source-option.source-selected { border-color: #c8c2ef; background: var(--accent-soft); }
  .source-check { width: 15px; height: 15px; flex: 0 0 15px; display: grid; place-items: center; border: 1px solid var(--faint); border-radius: 4px; color: var(--accent); font-size: 10px; }
  .source-option > span:last-child { display: grid; gap: 2px; }
  .source-option strong { font-size: 9px; font-weight: 620; }
  .source-option small { color: var(--muted); font-size: 8px; }
  .discovery-footnote { margin-top: 8px; padding: 8px; border-radius: 6px; background: #f5f6f8; color: var(--muted); font-size: 8px; line-height: 1.45; }
  .discovery-footnote strong { display: block; margin-bottom: 3px; color: var(--ink); }
  .appearance-content > .prototype-notice { max-width: 690px; }
  .appearance-panel { max-width: 760px; margin-top: 14px; padding: 17px 18px; }
  .theme-options { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 8px; margin-top: 13px; }
  .theme-option { min-width: 0; display: grid; gap: 5px; padding: 7px; border: 1px solid var(--line); border-radius: 7px; background: var(--surface); color: var(--ink); text-align: left; cursor: pointer; }
  .theme-option:hover, .theme-option-selected { border-color: var(--accent); box-shadow: 0 0 0 1px color-mix(in srgb, var(--accent) 18%, transparent); }
  .theme-option strong { font-size: 9px; font-weight: 650; }
  .theme-option small { overflow: hidden; color: var(--muted); font-size: 8px; text-overflow: ellipsis; white-space: nowrap; }
  .theme-swatch { height: 35px; display: flex; align-items: flex-end; gap: 4px; padding: 6px; border: 1px solid var(--line); border-radius: 5px; background: #f4f6f9; }
  .theme-swatch i { width: 26%; height: 14px; border: 1px solid #e2e6ee; border-radius: 3px; background: #fff; }
  .theme-swatch i:nth-child(2) { height: 20px; }
  .theme-swatch i:nth-child(3) { width: 16%; border-color: #c9c3f2; background: #7565dc; }
  .theme-swatch-dark, .theme-swatch-dark-dimmed { border-color: #353d4a; background: #151a23; }
  .theme-swatch-dark i, .theme-swatch-dark-dimmed i { border-color: #3b4352; background: #202735; }
  .theme-swatch-dark i:nth-child(3), .theme-swatch-dark-dimmed i:nth-child(3) { border-color: #6558be; background: #8274e6; }
  .theme-swatch-dark-dimmed { background: #22272e; }
  .theme-swatch-dark-dimmed i { border-color: #444c56; background: #2d333b; }
  .palette-panel { margin-top: 10px; }
  .palette-panel-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .palette-panel-heading h2 { margin-top: 6px; }
  .palette-selectors { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .palette-selectors .field { margin-top: 10px; }
  .palette-inheritance-note { margin: 7px 0 0; color: var(--muted); font-size: 9px; }
  .color-profile-name { max-width: 320px; margin-top: 9px; }
  .color-groups { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; margin-top: 10px; }
  .color-group { min-width: 0; display: grid; gap: 6px; margin: 0; padding: 8px; border: 1px solid var(--line); border-radius: 7px; }
  .color-group legend { padding: 0 4px; color: var(--muted); font-size: 8px; font-weight: 700; }
  .color-field { display: flex; align-items: center; justify-content: space-between; gap: 5px; color: var(--ink); font-size: 8px; }
  .color-field input { width: 32px; height: 23px; padding: 2px; border: 1px solid var(--line); border-radius: 5px; background: var(--surface); cursor: pointer; }
  .appearance-preview { max-width: 760px; display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-top: 10px; padding: 9px 12px; border: 1px solid var(--line); border-radius: 8px; background: var(--surface); }
  .appearance-preview > div { display: flex; align-items: center; gap: 8px; }
  .preview-dot { width: 8px; height: 8px; border-radius: 50%; background: var(--accent); }
  .appearance-preview > div > span:last-child { display: grid; gap: 2px; }
  .appearance-preview strong { color: var(--ink); font-size: 9px; }
  .appearance-preview small { color: var(--muted); font-size: 8px; }
  .appearance-preview .primary-button { min-height: 30px; border-color: var(--accent); background: var(--accent); font-size: 9px; }
  .setup-dialog { width: min(420px, calc(100% - 28px)); max-height: min(90vh, 520px); padding: 22px; border: 1px solid var(--line); border-radius: 12px; background: var(--surface); color: var(--ink); box-shadow: 0 24px 80px #11182740; }
  .setup-dialog::backdrop { background: #11182766; backdrop-filter: blur(3px); }
  .setup-dialog h2 { margin: 12px 0 0; font-size: 19px; letter-spacing: -.5px; }
  .setup-dialog .field { margin-top: 13px; }
  .setup-dialog .wizard-actions { margin-top: 18px; }
  .setup-dialog .secondary-button { margin-top: 0; }
  .panel-index { display: flex; align-items: center; gap: 9px; color: #9aa3b0; font-size: 8px; font-weight: 750; letter-spacing: 1.15px; }
  .panel-index span { color: #7a6ade; font-family: ui-monospace, SFMono-Regular, monospace; }
  .feature-panel h2 { margin: 18px 0 0; color: #303b4f; font-size: 18px; font-weight: 680; letter-spacing: -.55px; }
  .feature-panel p { max-width: 540px; margin: 10px 0 0; color: #7c8798; font-size: 13px; line-height: 1.75; }
  .secondary-button { min-height: 36px; margin-top: 22px; padding: 0 12px; border: 1px solid #e4e7ed; border-radius: 7px; background: #fff; color: #5e697a; font-size: 10px; font-weight: 630; cursor: pointer; }
  .secondary-button:hover { border-color: #c7c1ef; color: #5e4cc7; background: #fcfbff; }
  .secondary-button span { margin-right: 5px; font-size: 13px; }
  .prototype-notice { display: flex; align-items: flex-start; gap: 10px; max-width: 690px; margin-top: 23px; padding: 12px 14px; border: 1px solid #dcd7fb; border-radius: 8px; background: #f8f7ff; color: #62559f; }
  .prototype-notice > span { width: 18px; height: 18px; flex: 0 0 18px; border: 1px solid #8a7ade; border-radius: 50%; font-family: Georgia, serif; font-size: 12px; font-style: italic; line-height: 16px; text-align: center; }
  .prototype-notice p { margin: 0; font-size: 11px; line-height: 1.6; }
  .prototype-notice strong { color: #433a77; }
  .wizard-steps { max-width: 690px; display: flex; gap: 9px; margin: 24px 0 13px; padding: 0; list-style: none; }
  .wizard-steps li { flex: 1; display: flex; align-items: center; gap: 8px; padding: 10px 11px; border: 1px solid var(--line); border-radius: 7px; color: var(--faint); font-family: ui-monospace, SFMono-Regular, monospace; font-size: 10px; }
  .wizard-steps li span { color: var(--muted); font-family: inherit; }
  .wizard-steps li.current { border-color: #bcb3f0; background: var(--accent-soft); color: #5e4cc7; }
  .wizard-steps li.current span { color: #5546b7; font-weight: 650; }
  .wizard-steps li.complete { color: var(--green); }
  .wizard-panel { max-width: 690px; margin-top: 0; padding: 23px 25px; border: 1px solid var(--line); border-radius: 12px; background: var(--surface); box-shadow: 0 2px 8px #26345108; }
  .wizard-panel h2 { margin: 16px 0 0; color: var(--ink); font-size: 18px; font-weight: 680; letter-spacing: -.5px; }
  .form-intro { max-width: 560px; margin: 8px 0 19px; color: var(--muted); font-size: 11px; line-height: 1.7; }
  .field { display: grid; gap: 7px; margin-top: 15px; color: var(--ink); font-size: 11px; font-weight: 650; }
  .field input, .field select { width: 100%; min-height: 39px; padding: 0 11px; border: 1px solid var(--line); border-radius: 6px; background: var(--surface); color: var(--ink); font: inherit; font-weight: 450; }
  .field input::placeholder { color: var(--faint); }
  .field small { color: var(--muted); font-size: 10px; font-weight: 400; line-height: 1.5; }
  .field input:focus-visible, .field select:focus-visible { outline: 3px solid #7968eb; outline-offset: 2px; }
  .credential-note, .review-warning { margin-top: 17px; padding: 11px 12px; border-radius: 7px; background: #f5f6f8; color: #727d8c; font-size: 10px; line-height: 1.55; }
  .credential-note strong, .review-warning strong { color: #505b6d; }
  .form-error { margin: 13px 0 0; color: #a32e37; font-size: 11px; line-height: 1.5; }
  .wizard-actions { display: flex; justify-content: space-between; gap: 10px; margin-top: 21px; }
  .wizard-actions .secondary-button, .wizard-actions .primary-button { margin-top: 0; }
  .primary-button { min-height: 36px; padding: 0 13px; border: 1px solid #5c4bc5; border-radius: 7px; background: #6958d4; color: #fff; font-size: 10px; font-weight: 650; cursor: pointer; }
  .primary-button:hover { background: #5847c2; }
  .primary-button span { margin-left: 6px; font-size: 13px; }
  .review-list { display: grid; gap: 0; margin: 19px 0 0; border: 1px solid var(--line); border-radius: 8px; overflow: hidden; }
  .review-list > div { display: grid; grid-template-columns: minmax(120px, .4fr) 1fr; gap: 12px; padding: 11px 13px; border-bottom: 1px solid var(--line); }
  .review-list > div:last-child { border-bottom: 0; }
  .review-list dt { color: var(--muted); font-size: 10px; }
  .review-list dd { min-width: 0; margin: 0; overflow-wrap: anywhere; color: var(--ink); font-size: 10px; font-weight: 600; }
  .review-list code { font-family: ui-monospace, SFMono-Regular, monospace; font-size: 10px; }
  .completion-panel { position: relative; padding-left: 62px; }
  .completion-icon { position: absolute; top: 22px; left: 23px; width: 25px; height: 25px; display: grid; place-items: center; border-radius: 50%; background: #e7f4ee; color: #27856b; font-size: 13px; }
  .back-link { display: block; }
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
    .brand-mark { width: 29px; height: 29px; flex-basis: 29px; }
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
    .feature-panel, .wizard-panel { padding: 19px; }
    .wizard-steps { gap: 5px; }
    .wizard-steps li { justify-content: center; padding: 8px 4px; font-size: 9px; }
    .completion-panel { padding-left: 54px; }
    .completion-icon { left: 17px; }
    .main-footer { flex-wrap: wrap; gap: 5px; padding: 16px 19px; font-size: 8px; }
    .footer-spacer { flex-basis: 10px; }
    .footer-safe { margin-left: auto; }
  }
  @media (max-height: 680px) {
    .topbar { height: 44px; flex-basis: 44px; }
    .content { padding-top: 14px; padding-bottom: 8px; }
    .intro { max-width: 100%; }
    h1 { margin-top: 8px; font-size: clamp(30px, 4vw, 38px); letter-spacing: -1.8px; line-height: 1.05; }
    .intro-copy { margin-top: 7px; font-size: 11px; line-height: 1.45; }
    .environment-card { gap: 9px; margin-top: 11px; padding: 7px 10px; }
    .environment-symbol { width: 25px; height: 25px; flex: 0 0 25px; }
    .environment-copy { gap: 1px; }
    .environment-copy span { font-size: 9px; }
    .not-connected { font-size: 7px; }
    .section-heading { margin: 17px 0 8px; }
    .section-heading h2 { font-size: 12px; }
    .section-heading p { margin-top: 3px; font-size: 9px; }
    .step-count { font-size: 8px; }
    .route-grid { gap: 5px; }
    .route-card {
      display: grid;
      grid-template-columns: 28px minmax(0, 1fr) 92px;
      grid-template-rows: auto auto;
      align-items: center;
      gap: 2px 9px;
      padding: 7px 9px;
    }
    .card-topline { grid-column: 1; grid-row: 1 / span 2; align-self: center; min-height: 0; }
    .route-icon { width: 26px; height: 26px; }
    .draft-chip { display: none; }
    .route-copy { grid-column: 2; grid-row: 1; min-width: 0; margin: 0; }
    .route-eyebrow { display: none; }
    .route-copy h3 { margin: 0; font-size: 11px; }
    .route-copy p { min-height: 0; margin: 2px 0 0; font-size: 9px; line-height: 1.3; }
    .route-note { grid-column: 2; grid-row: 2; min-height: 0; margin: 0; padding: 0; border: 0; font-size: 8px; line-height: 1.25; }
    .route-action { grid-column: 3; grid-row: 1 / span 2; min-height: 29px; margin: 0; padding: 0 6px; font-size: 8px; }
    .route-action > span { font-size: 11px; }
    .draft-message { gap: 7px; margin-top: 6px; padding: 6px 8px; }
    .draft-message p { font-size: 8px; line-height: 1.3; }
    .draft-message p strong { font-size: 9px; }
    .draft-message-icon { width: 15px; height: 15px; flex-basis: 15px; font-size: 9px; }
    .draft-message button { font-size: 8px; }
    .privacy-strip { gap: 7px; margin-top: 7px; padding: 6px 8px; }
    .privacy-icon { width: 16px; height: 16px; flex-basis: 16px; }
    .privacy-strip p, .privacy-strip a { font-size: 8px; }
    .privacy-strip p strong { display: block; }
    .main-footer { min-height: 35px; padding-top: 8px; padding-bottom: 8px; }
    .secondary-content { padding-top: 14px; }
    .secondary-content .intro-copy { display: none; }
    .prototype-notice { gap: 7px; margin-top: 7px; padding: 6px 8px; }
    .prototype-notice > span { width: 15px; height: 15px; flex-basis: 15px; font-size: 10px; line-height: 13px; }
    .prototype-notice p { font-size: 9px; line-height: 1.35; }
    .wizard-steps { gap: 5px; margin: 6px 0; }
    .wizard-steps li { justify-content: center; padding: 5px 5px; font-size: 9px; }
    .wizard-panel { padding: 10px 13px; }
    .wizard-panel h2 { margin-top: 6px; font-size: 14px; }
    .form-intro { margin: 3px 0 5px; font-size: 8px; line-height: 1.25; }
    .field { gap: 3px; margin-top: 5px; font-size: 9px; }
    .field input, .field select { min-height: 29px; padding: 0 8px; }
    .field small { display: none; }
    .credential-note, .review-warning { margin-top: 6px; padding: 6px 8px; font-size: 8px; }
    .form-error { margin-top: 5px; font-size: 9px; }
    .wizard-actions { margin-top: 7px; }
    .wizard-actions .secondary-button, .wizard-actions .primary-button { min-height: 29px; }
    .review-list { margin-top: 9px; }
    .review-list > div { padding: 7px 9px; }
    .completion-icon { top: 14px; left: 15px; }
  }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after { scroll-behavior: auto !important; transition-duration: .01ms !important; animation-duration: .01ms !important; animation-iteration-count: 1 !important; }
  }
  @media (forced-colors: active) {
    .route-card, .environment-card, .feature-panel, .settings-panel, .discovery-panel, .privacy-strip, .wizard-panel, .wizard-steps li, .review-list { border: 1px solid CanvasText; }
    .nav-item.active { outline: 1px solid Highlight; outline-offset: -1px; }
    :global(button:focus-visible), :global(a:focus-visible), .field input:focus-visible, .field select:focus-visible { outline: 2px solid Highlight; }
    .draft-chip, .draft-message-icon, .route-action-selected { color: Highlight; }
  }
  :global(.app-shell.theme-dark) {
    --ink: #e5e8f0;
    --muted: #a1aabc;
    --faint: #798397;
    --line: #2a3040;
    --surface: #191e2a;
    --canvas: #131722;
    --accent-soft: #29243f;
    --green: #71c8a5;
    background: var(--canvas);
    color: var(--ink);
  }
  :global(.app-shell.theme-dark.theme-dimmed) {
    --ink: #adbac7;
    --muted: #8b949e;
    --faint: #768390;
    --line: #444c56;
    --surface: #2d333b;
    --canvas: #22272e;
    --accent-soft: #343044;
    --green: #6bc5a0;
  }
  :global(.app-shell.theme-dark) .rail,
  :global(.app-shell.theme-dark) .topbar { background: var(--surface); border-color: var(--line); }
  :global(.app-shell.theme-dark) .brand,
  :global(.app-shell.theme-dark) .section-heading h2,
  :global(.app-shell.theme-dark) .route-copy h3,
  :global(.app-shell.theme-dark) .feature-panel h2,
  :global(.app-shell.theme-dark) .environment-copy strong { color: #e1e5ee; }
  :global(.app-shell.theme-dark.theme-dimmed) .brand,
  :global(.app-shell.theme-dark.theme-dimmed) .settings-panel h2,
  :global(.app-shell.theme-dark.theme-dimmed) .discovery-panel h2,
  :global(.app-shell.theme-dark.theme-dimmed) .profile-summary strong,
  :global(.app-shell.theme-dark.theme-dimmed) .workspace-identity strong { color: #adbac7; }
  :global(.app-shell.theme-dark) .brand-name span,
  :global(.app-shell.theme-dark) .intro-copy,
  :global(.app-shell.theme-dark) .route-copy p,
  :global(.app-shell.theme-dark) .feature-panel p,
  :global(.app-shell.theme-dark) .environment-copy span { color: #9da7b8; }
  :global(.app-shell.theme-dark) .nav-item { color: #a3adbd; }
  :global(.app-shell.theme-dark) .nav-item:hover { background: #222838; color: #e5e8f0; }
  :global(.app-shell.theme-dark) .nav-item.active { background: var(--accent-soft); color: #b2aaff; }
  :global(.app-shell.theme-dark) .nav-item.active .nav-icon { color: #a095ff; }
  :global(.app-shell.theme-dark) .rail-note,
  :global(.app-shell.theme-dark) .environment-card,
  :global(.app-shell.theme-dark) .route-card,
  :global(.app-shell.theme-dark) .feature-panel,
  :global(.app-shell.theme-dark) .settings-panel,
  :global(.app-shell.theme-dark) .discovery-panel,
  :global(.app-shell.theme-dark) .appearance-preview { background: var(--surface); border-color: var(--line); }
  :global(.app-shell.theme-dark) .wizard-panel { background: var(--surface); border-color: var(--line); }
  :global(.app-shell.theme-dark) .prototype-notice { background: #24213a; border-color: #4b426f; color: #c2baff; }
  :global(.app-shell.theme-dark) .prototype-notice strong { color: #e2ddff; }
  :global(.app-shell.theme-dark) .credential-note,
  :global(.app-shell.theme-dark) .review-warning,
  :global(.app-shell.theme-dark) .discovery-footnote { background: #222838; color: #a9b3c3; }
  :global(.app-shell.theme-dark) .credential-note strong,
  :global(.app-shell.theme-dark) .review-warning strong,
  :global(.app-shell.theme-dark) .discovery-footnote strong { color: #e0e4ec; }
  :global(.app-shell.theme-dark) .form-error { color: #ff9da4; }
  :global(.app-shell.theme-dark) .completion-icon { background: #1d302d; color: #83c7aa; }
  :global(.app-shell.theme-dark) .rail-note p,
  :global(.app-shell.theme-dark) .route-note,
  :global(.app-shell.theme-dark) .not-connected,
  :global(.app-shell.theme-dark) .topbar-status,
  :global(.app-shell.theme-dark) .section-heading p { color: #9aa5b6; }
  :global(.app-shell.theme-dark) .environment-symbol,
  :global(.app-shell.theme-dark) .route-card:nth-child(3) .route-icon { background: #29243f; border-color: #393253; color: #b2aaff; }
  :global(.app-shell.theme-dark) .route-card:nth-child(2) .route-icon { background: #1d302d; border-color: #2d423d; color: #83c7aa; }
  :global(.app-shell.theme-dark) .route-icon { background: #202635; border-color: #303747; color: #b0bacb; }
  :global(.app-shell.theme-dark) .route-action,
  :global(.app-shell.theme-dark) .secondary-button,
  :global(.app-shell.theme-dark) .field input,
  :global(.app-shell.theme-dark) .field select,
  :global(.app-shell.theme-dark) .source-option { background: #1b2130; border-color: #343b4c; color: #c4ccda; }
  :global(.app-shell.theme-dark) .route-action:hover,
  :global(.app-shell.theme-dark) .secondary-button:hover { background: #24233a; border-color: #655ba5; color: #c0b8ff; }
  :global(.app-shell.theme-dark) .route-action-selected,
  :global(.app-shell.theme-dark) .draft-message { background: #24213a; border-color: #4b426f; color: #c2baff; }
  :global(.app-shell.theme-dark) .draft-message p { color: #aaa5c3; }
  :global(.app-shell.theme-dark) .draft-message p strong { color: #ddd8ff; }
  :global(.app-shell.theme-dark) .draft-message-icon { background: #393253; color: #c2baff; }
  :global(.app-shell.theme-dark) .privacy-strip { background: var(--surface); border-color: var(--line); }
  :global(.app-shell.theme-dark) .privacy-strip p { color: #a1aabc; }
  :global(.app-shell.theme-dark) .privacy-strip p strong { color: #d1d7e2; }
  :global(.app-shell.theme-dark) .privacy-icon { background: #242b3a; color: #aab4c4; }
  :global(.app-shell.theme-dark) .main-footer { color: #808b9e; }
  :global(.app-shell.theme-dark) .route-note { border-color: var(--line); }
  :global(.app-shell.theme-dark) h1 { color: #e4e7ef; }
  :global(.app-shell.theme-dark) .overline { color: #a3adbd; }
  :global(.app-shell.theme-dark) .route-eyebrow,
  :global(.app-shell.theme-dark) .panel-index { color: #8994a7; }
  :global(.app-shell.theme-dark) .workspace-glyph { background: #242b3a; color: #aab4c4; }
  :global(.app-shell.theme-dark) .empty-workspaces { border-color: var(--line); }
  :global(.app-shell.theme-dark) .theme-option { background-color: var(--surface); color: var(--ink); }
  :global(.app-shell.theme-dark) .setup-dialog { background: var(--surface); color: var(--ink); }
  @media (max-width: 920px) {
    .profile-columns { grid-template-columns: 1fr; }
  }
  @media (max-width: 620px) {
    .profile-columns { gap: 8px; margin-top: 8px; }
    .settings-panel, .discovery-panel summary, .appearance-panel { padding: 11px; }
    .discovery-options { padding: 0 11px 11px; }
    .page-heading-row { align-items: flex-start; }
    .page-heading-row h1 { font-size: 32px; }
    .page-heading-row > .primary-button { min-height: 32px; padding: 0 8px; font-size: 9px; }
    .theme-options { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .color-groups { grid-template-columns: 1fr; }
    .workspace-row { grid-template-columns: minmax(0, 1fr); }
    .workspace-profile-field, .inheritance-note { grid-column: 1; }
  }
  @media (max-height: 680px) {
    .profiles-content, .appearance-content { padding-top: 11px; padding-bottom: 7px; }
    .profiles-content .intro-copy, .appearance-content .page-heading-row .intro-copy { margin-top: 4px; font-size: 9px; line-height: 1.3; }
    .profiles-content h1, .appearance-content h1 { font-size: 31px; }
    .profiles-content > .prototype-notice, .appearance-content > .prototype-notice { margin-top: 7px; padding: 6px 8px; }
    .profile-columns { gap: 7px; margin-top: 7px; }
    .profile-main-column { gap: 6px; }
    .settings-panel, .discovery-panel summary, .appearance-panel { padding: 9px 11px; }
    .settings-panel h2, .discovery-panel h2 { margin-top: 5px; font-size: 11px; }
    .panel-description { margin-top: 2px; font-size: 8px; line-height: 1.3; }
    .profile-main-column .field { margin-top: 6px; }
    .profile-summary { margin-top: 6px; padding-top: 6px; }
    .empty-workspaces { margin-top: 7px; padding: 6px; }
    .empty-workspaces p { font-size: 8px; }
    .workspace-list { max-height: 110px; margin-top: 6px; }
    .discovery-options { padding: 0 11px 9px; }
    .source-list { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .source-option { padding: 5px; }
    .discovery-footnote { margin-top: 6px; padding: 6px; }
    .appearance-panel { margin-top: 7px; }
    .theme-options { gap: 5px; margin-top: 7px; }
    .theme-option { gap: 3px; padding: 5px; }
    .theme-option small { display: none; }
    .theme-swatch { height: 19px; padding: 3px; }
    .theme-swatch i { height: 7px; }
    .theme-swatch i:nth-child(2) { height: 11px; }
    .palette-panel { margin-top: 6px; }
    .palette-selectors { gap: 6px; }
    .palette-selectors .field { margin-top: 6px; }
    .color-groups { gap: 4px; margin-top: 6px; }
    .color-group { gap: 4px; padding: 5px; }
    .color-field { font-size: 7px; }
    .color-field input { width: 26px; height: 20px; }
    .appearance-preview { display: none; }
    .setup-dialog { padding: 16px; }
  }
  :global(.app-shell) { background: var(--canvas); color: var(--ink); }
  :global(.app-shell) .rail,
  :global(.app-shell) .topbar { background: var(--surface); border-color: var(--line); }
  :global(.app-shell) .main-area { background: var(--canvas); }
  :global(.app-shell) .rail-note,
  :global(.app-shell) .environment-card,
  :global(.app-shell) .route-card,
  :global(.app-shell) .feature-panel,
  :global(.app-shell) .settings-panel,
  :global(.app-shell) .discovery-panel,
  :global(.app-shell) .wizard-panel,
  :global(.app-shell) .privacy-strip,
  :global(.app-shell) .appearance-preview,
  :global(.app-shell) .setup-dialog { background: var(--surface); border-color: var(--line); }
  :global(.app-shell) .nav-item.active,
  :global(.app-shell) .theme-option-selected,
  :global(.app-shell) .source-selected,
  :global(.app-shell) .route-action-selected,
  :global(.app-shell) .wizard-steps li.current,
  :global(.app-shell) .draft-message { background: var(--accent-soft); border-color: var(--accent); color: var(--accent); }
  :global(.app-shell) .nav-item.active .nav-icon { color: var(--accent); }
  :global(.app-shell) .active-dot,
  :global(.app-shell) .overline-line,
  :global(.app-shell) .preview-dot { background: var(--accent); }
  :global(.app-shell) h1,
  :global(.app-shell) .brand,
  :global(.app-shell) .brand-name,
  :global(.app-shell) .section-heading h2,
  :global(.app-shell) .route-copy h3,
  :global(.app-shell) .feature-panel h2,
  :global(.app-shell) .settings-panel h2,
  :global(.app-shell) .discovery-panel h2,
  :global(.app-shell) .environment-copy strong,
  :global(.app-shell) .profile-summary strong,
  :global(.app-shell) .workspace-identity strong,
  :global(.app-shell) .empty-workspaces strong,
  :global(.app-shell) .appearance-preview strong,
  :global(.app-shell) .setup-dialog h2 { color: var(--ink); }
  :global(.app-shell) .intro-copy,
  :global(.app-shell) .rail-label,
  :global(.app-shell) .rail-version,
  :global(.app-shell) .brand-name span,
  :global(.app-shell) .nav-item,
  :global(.app-shell) .topbar-status,
  :global(.app-shell) .breadcrumb > span:first-child,
  :global(.app-shell) .section-heading p,
  :global(.app-shell) .overline,
  :global(.app-shell) .route-copy p,
  :global(.app-shell) .route-eyebrow,
  :global(.app-shell) .route-note,
  :global(.app-shell) .not-connected,
  :global(.app-shell) .panel-description,
  :global(.app-shell) .panel-index,
  :global(.app-shell) .main-footer,
  :global(.app-shell) .profile-summary small,
  :global(.app-shell) .workspace-identity code,
  :global(.app-shell) .inheritance-note,
  :global(.app-shell) .empty-workspaces p,
  :global(.app-shell) .appearance-preview small,
  :global(.app-shell) .rail-note p,
  :global(.app-shell) .draft-message p,
  :global(.app-shell) .privacy-strip p,
  :global(.app-shell) .source-option small,
  :global(.app-shell) .theme-option small,
  :global(.app-shell) .breadcrumb { color: var(--muted); }
  :global(.app-shell) h1 > span,
  :global(.app-shell) .primary-button,
  :global(.app-shell) .draft-chip,
  :global(.app-shell) .wizard-steps li.current,
  :global(.app-shell) .main-footer .footer-safe { --focus-ring: var(--accent); }
  :global(.app-shell) h1 > span,
  :global(.app-shell) .overline-line,
  :global(.app-shell) .primary-button,
  :global(.app-shell) .active-dot { color: var(--accent); }
  :global(.app-shell) .primary-button,
  :global(.app-shell) .appearance-preview .primary-button { background: var(--accent); border-color: var(--accent); color: #fff; }
  :global(.app-shell) .nav-item:hover,
  :global(.app-shell) .secondary-button:hover,
  :global(.app-shell) .route-action:hover,
  :global(.app-shell) .source-option:hover { border-color: var(--accent); color: var(--accent); }
  :global(.app-shell) .nav-item.active { color: var(--accent); }
  :global(.app-shell) .field input,
  :global(.app-shell) .field select,
  :global(.app-shell) .source-option strong,
  :global(.app-shell) .theme-option strong,
  :global(.app-shell) .source-option,
  :global(.app-shell) .route-action,
  :global(.app-shell) .secondary-button,
  :global(.app-shell) .theme-option { background-color: var(--surface); border-color: var(--line); color: var(--ink); }
  :global(.app-shell) .prototype-notice,
  :global(.app-shell) .credential-note,
  :global(.app-shell) .review-warning,
  :global(.app-shell) .discovery-footnote,
  :global(.app-shell) .count-chip,
  :global(.app-shell) .workspace-glyph { background: var(--accent-soft); border-color: var(--line); color: var(--accent); }
  :global(.app-shell) .prototype-notice strong,
  :global(.app-shell) .credential-note strong,
  :global(.app-shell) .review-warning strong,
  :global(.app-shell) .discovery-footnote strong { color: var(--ink); }
  :global(.app-shell) .profile-summary,
  :global(.app-shell) .route-note { border-color: var(--line); }
  :global(.app-shell) .color-group { border-color: var(--line); }
  :global(.app-shell) .color-group legend,
  :global(.app-shell) .color-field { color: var(--ink); }
  :global(.app-shell) .setup-dialog { color: var(--ink); }
  :global(.app-shell) .primary-button:focus-visible,
  :global(button:focus-visible),
  :global(a:focus-visible) { outline-color: var(--focus-ring); }
  :global(.app-shell.theme-dark) .rail,
  :global(.app-shell.theme-dark) .topbar,
  :global(.app-shell.theme-dark) .rail-note,
  :global(.app-shell.theme-dark) .environment-card,
  :global(.app-shell.theme-dark) .route-card,
  :global(.app-shell.theme-dark) .feature-panel,
  :global(.app-shell.theme-dark) .settings-panel,
  :global(.app-shell.theme-dark) .discovery-panel,
  :global(.app-shell.theme-dark) .wizard-panel,
  :global(.app-shell.theme-dark) .privacy-strip,
  :global(.app-shell.theme-dark) .appearance-preview,
  :global(.app-shell.theme-dark) .setup-dialog { background: var(--surface); border-color: var(--line); }
  :global(.app-shell.theme-dark) .main-area { background: var(--canvas); }
  :global(.app-shell.theme-dark) h1,
  :global(.app-shell.theme-dark) .brand,
  :global(.app-shell.theme-dark) .brand-name,
  :global(.app-shell.theme-dark) .section-heading h2,
  :global(.app-shell.theme-dark) .route-copy h3,
  :global(.app-shell.theme-dark) .feature-panel h2,
  :global(.app-shell.theme-dark) .settings-panel h2,
  :global(.app-shell.theme-dark) .discovery-panel h2,
  :global(.app-shell.theme-dark) .environment-copy strong,
  :global(.app-shell.theme-dark) .profile-summary strong,
  :global(.app-shell.theme-dark) .workspace-identity strong,
  :global(.app-shell.theme-dark) .empty-workspaces strong,
  :global(.app-shell.theme-dark) .appearance-preview strong,
  :global(.app-shell.theme-dark) .setup-dialog h2 { color: var(--ink); }
  :global(.app-shell.theme-dark) .intro-copy,
  :global(.app-shell.theme-dark) .rail-label,
  :global(.app-shell.theme-dark) .rail-version,
  :global(.app-shell.theme-dark) .brand-name span,
  :global(.app-shell.theme-dark) .nav-item,
  :global(.app-shell.theme-dark) .topbar-status,
  :global(.app-shell.theme-dark) .breadcrumb > span:first-child,
  :global(.app-shell.theme-dark) .section-heading p,
  :global(.app-shell.theme-dark) .overline,
  :global(.app-shell.theme-dark) .route-copy p,
  :global(.app-shell.theme-dark) .route-eyebrow,
  :global(.app-shell.theme-dark) .route-note,
  :global(.app-shell.theme-dark) .not-connected,
  :global(.app-shell.theme-dark) .panel-description,
  :global(.app-shell.theme-dark) .panel-index,
  :global(.app-shell.theme-dark) .main-footer,
  :global(.app-shell.theme-dark) .profile-summary small,
  :global(.app-shell.theme-dark) .workspace-identity code,
  :global(.app-shell.theme-dark) .inheritance-note,
  :global(.app-shell.theme-dark) .empty-workspaces p,
  :global(.app-shell.theme-dark) .appearance-preview small,
  :global(.app-shell.theme-dark) .rail-note p,
  :global(.app-shell.theme-dark) .draft-message p,
  :global(.app-shell.theme-dark) .privacy-strip p,
  :global(.app-shell.theme-dark) .source-option small,
  :global(.app-shell.theme-dark) .theme-option small,
  :global(.app-shell.theme-dark) .breadcrumb { color: var(--muted); }
  :global(.app-shell.theme-dark) h1 > span,
  :global(.app-shell.theme-dark) .primary-button,
  :global(.app-shell.theme-dark) .draft-chip { color: var(--accent); }
  :global(.app-shell.theme-dark) .primary-button,
  :global(.app-shell.theme-dark) .appearance-preview .primary-button { background: var(--accent); border-color: var(--accent); color: var(--surface); }
  :global(.app-shell.theme-dark) .nav-item.active,
  :global(.app-shell.theme-dark) .theme-option-selected,
  :global(.app-shell.theme-dark) .source-selected,
  :global(.app-shell.theme-dark) .route-action-selected,
  :global(.app-shell.theme-dark) .wizard-steps li.current,
  :global(.app-shell.theme-dark) .draft-message,
  :global(.app-shell.theme-dark) .prototype-notice,
  :global(.app-shell.theme-dark) .credential-note,
  :global(.app-shell.theme-dark) .review-warning,
  :global(.app-shell.theme-dark) .discovery-footnote,
  :global(.app-shell.theme-dark) .count-chip,
  :global(.app-shell.theme-dark) .workspace-glyph { background: var(--accent-soft); border-color: var(--line); color: var(--accent); }
  :global(.app-shell.theme-dark) .field input,
  :global(.app-shell.theme-dark) .field select,
  :global(.app-shell.theme-dark) .source-option strong,
  :global(.app-shell.theme-dark) .theme-option strong,
  :global(.app-shell.theme-dark) .source-option,
  :global(.app-shell.theme-dark) .route-action,
  :global(.app-shell.theme-dark) .secondary-button,
  :global(.app-shell.theme-dark) .theme-option,
  :global(.app-shell.theme-dark) .color-field input { background-color: var(--surface); border-color: var(--line); color: var(--ink); }
  :global(.app-shell.theme-dark) .prototype-notice strong,
  :global(.app-shell.theme-dark) .credential-note strong,
  :global(.app-shell.theme-dark) .review-warning strong,
  :global(.app-shell.theme-dark) .discovery-footnote strong,
  :global(.app-shell.theme-dark) .color-group legend,
  :global(.app-shell.theme-dark) .color-field { color: var(--ink); }
  :global(.app-shell.theme-dark) .profile-summary,
  :global(.app-shell.theme-dark) .route-note,
  :global(.app-shell.theme-dark) .color-group { border-color: var(--line); }
  :global(.app-shell.theme-dark) .nav-item:hover,
  :global(.app-shell.theme-dark) .secondary-button:hover,
  :global(.app-shell.theme-dark) .route-action:hover,
  :global(.app-shell.theme-dark) .source-option:hover { border-color: var(--accent); color: var(--accent); }
  :global(.app-shell.theme-dark) .nav-item.active { color: var(--accent); }
  :global(button:focus-visible),
  :global(a:focus-visible) { outline: 3px solid var(--focus-ring); }
  .skip-link { position: fixed; z-index: 20; top: 8px; left: 8px; transform: translateY(-160%); padding: 9px 12px; border-radius: 6px; background: var(--surface); color: var(--ink); }
  .skip-link:focus { transform: translateY(0); }
  .topbar-actions { display: flex; align-items: center; gap: 12px; }
  .feedback-trigger { min-height: 30px; padding: 0 10px; border: 1px solid var(--line); border-radius: 6px; background: var(--surface); color: var(--ink); font-size: 9px; font-weight: 650; cursor: pointer; }
  .feedback-trigger:hover { border-color: var(--accent); color: var(--accent); }
  .feedback-trigger span { margin-left: 4px; color: var(--accent); }
  .project-content { padding-top: 47px; }
  .project-hero { max-width: 760px; }
  .project-hero h1 { margin-top: 18px; font-size: clamp(40px, 5.2vw, 62px); letter-spacing: -3px; }
  .project-lead { max-width: 680px; margin: 18px 0 0; color: var(--muted); font-size: 15px; line-height: 1.75; }
  .project-actions { display: flex; flex-wrap: wrap; gap: 9px; margin-top: 22px; }
  .project-actions .primary-button,
  .project-actions .secondary-button { display: inline-flex; align-items: center; justify-content: center; gap: 8px; min-height: 39px; margin: 0; text-decoration: none; }
  .project-disclaimer { margin: 13px 0 0; color: var(--muted); font-size: 9px; }
  .project-feature-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 10px; margin-top: 28px; }
  .project-feature { min-width: 0; padding: 15px; border: 1px solid var(--line); border-radius: 9px; background: var(--surface); }
  .project-feature-index { color: var(--accent); font-size: 8px; font-weight: 750; letter-spacing: 1px; }
  .project-feature h2 { margin: 9px 0 0; color: var(--ink); font-size: 14px; letter-spacing: -.3px; }
  .project-feature p { margin: 6px 0 0; color: var(--muted); font-size: 10px; line-height: 1.65; }
  .project-guide { margin-top: 15px; padding: 18px; border: 1px solid var(--line); border-radius: 10px; background: var(--surface); }
  .project-guide-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .project-guide-heading h2 { margin: 8px 0 0; color: var(--ink); font-size: 19px; letter-spacing: -.5px; }
  .text-button { padding: 7px 0; border: 0; background: transparent; color: var(--accent); font-size: 10px; font-weight: 650; cursor: pointer; }
  .text-button span { margin-left: 3px; }
  .demo-steps { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px 14px; margin: 15px 0 0; padding: 0; list-style: none; }
  .demo-steps li { display: flex; align-items: flex-start; gap: 9px; min-width: 0; }
  .demo-steps li > span { width: 21px; height: 21px; flex: 0 0 21px; display: grid; place-items: center; border-radius: 50%; background: var(--accent-soft); color: var(--accent); font-size: 9px; font-weight: 700; }
  .demo-steps strong { color: var(--ink); font-size: 10px; }
  .demo-steps p { margin: 3px 0 0; color: var(--muted); font-size: 9px; line-height: 1.5; }
  .demo-boundary { margin-top: 14px; padding: 10px 12px; border: 1px solid var(--line); border-radius: 7px; background: var(--canvas); }
  .demo-boundary strong { color: var(--ink); font-size: 9px; }
  .demo-boundary p { margin: 4px 0 0; color: var(--muted); font-size: 9px; line-height: 1.5; }
  .project-resources { display: flex; flex-wrap: wrap; gap: 9px 16px; margin-top: 13px; }
  .project-resources a { color: var(--accent); font-size: 9px; font-weight: 620; text-decoration: none; }
  .project-resources a:hover { text-decoration: underline; }
  .project-resources a span { margin-left: 3px; }
  .feedback-form { max-height: calc(90vh - 44px); overflow: auto; }
  .feedback-form textarea { width: 100%; min-height: 96px; resize: vertical; padding: 9px 11px; border: 1px solid var(--line); border-radius: 6px; background: var(--surface); color: var(--ink); font: inherit; font-size: 11px; line-height: 1.5; }
  .feedback-form textarea:focus-visible { outline: 2px solid var(--focus-ring); outline-offset: 2px; }
  .feedback-context { display: grid; gap: 4px; margin-top: 12px; padding: 9px 10px; border: 1px solid var(--line); border-radius: 7px; background: var(--canvas); }
  .feedback-context strong { color: var(--ink); font-size: 9px; }
  .feedback-context span, .feedback-context small { color: var(--muted); font-size: 8px; line-height: 1.45; }
  .feedback-privacy { margin: 9px 0 0; color: var(--muted); font-size: 9px; line-height: 1.5; }
  .feedback-form .wizard-actions { align-items: center; }
  .feedback-form .wizard-actions .secondary-button { margin: 0; }
  .feedback-submit-link { display: inline-flex; align-items: center; gap: 5px; min-height: 34px; text-decoration: none; }
  .feedback-link-disabled { opacity: .55; pointer-events: none; }
  .app-shell.theme-dark .project-feature,
  .app-shell.theme-dark .project-guide { background: var(--surface); border-color: var(--line); }
  .app-shell.theme-dark .project-feature h2,
  .app-shell.theme-dark .project-guide-heading h2,
  .app-shell.theme-dark .demo-steps strong,
  .app-shell.theme-dark .demo-boundary strong,
  .app-shell.theme-dark .feedback-context strong { color: var(--ink); }
  .app-shell.theme-dark .project-lead,
  .app-shell.theme-dark .project-disclaimer,
  .app-shell.theme-dark .project-feature p,
  .app-shell.theme-dark .demo-steps p,
  .app-shell.theme-dark .demo-boundary p,
  .app-shell.theme-dark .feedback-context span,
  .app-shell.theme-dark .feedback-context small,
  .app-shell.theme-dark .feedback-privacy { color: var(--muted); }
  .app-shell.theme-dark .demo-boundary,
  .app-shell.theme-dark .feedback-context { background: var(--canvas); border-color: var(--line); }
  .app-shell.theme-dark .feedback-trigger { background: var(--surface); border-color: var(--line); color: var(--ink); }
  .app-shell.theme-dark .feedback-form textarea { background: var(--surface); border-color: var(--line); color: var(--ink); }
  @media (max-width: 760px) {
    .project-content { padding-top: 30px; }
    .project-feature-grid { grid-template-columns: 1fr; gap: 7px; margin-top: 18px; }
    .project-feature { padding: 11px 13px; }
    .project-feature h2 { margin-top: 5px; }
    .project-feature p { margin-top: 4px; }
    .demo-steps { grid-template-columns: 1fr; }
    .project-guide { padding: 13px; }
  }
  @media (max-width: 620px) {
    .topbar-actions { gap: 6px; }
    .topbar-status { display: none; }
    .project-hero h1 { font-size: 39px; letter-spacing: -2px; }
    .project-lead { font-size: 12px; }
    .project-guide-heading { align-items: flex-start; }
    .project-resources { display: grid; gap: 8px; }
  }
  @media (max-height: 680px) {
    .project-content { padding-top: 12px; }
    .project-hero h1 { margin-top: 7px; font-size: 35px; }
    .project-lead { margin-top: 8px; font-size: 11px; line-height: 1.5; }
    .project-actions { margin-top: 10px; }
    .project-disclaimer { margin-top: 6px; }
    .project-feature-grid { margin-top: 12px; }
    .project-feature { padding: 9px; }
    .project-feature h2 { margin-top: 5px; font-size: 12px; }
    .project-feature p { font-size: 8px; line-height: 1.4; }
    .project-guide { margin-top: 8px; padding: 11px; }
    .project-guide-heading h2 { margin-top: 5px; font-size: 15px; }
    .demo-steps { gap: 5px 9px; margin-top: 8px; }
    .demo-steps p { font-size: 8px; line-height: 1.35; }
    .demo-boundary { margin-top: 8px; padding: 7px 9px; }
    .project-resources { margin-top: 8px; }
  }
</style>
