import {
  authDashboardHref,
  authLoginHref,
  getSubscriptionTier,
  getSupabaseClient,
  isAuthConfigured,
  subscriptionTierLabel,
} from "./auth.js";

function showUnconfigured() {
  const content = document.getElementById("auth-dashboard-content");
  const note = document.getElementById("auth-dashboard-unconfigured");
  if (content) content.hidden = true;
  if (note) {
    note.hidden = false;
    note.textContent =
      "Account features are not configured for this build. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then redeploy.";
  }
}

function renderDashboard(user) {
  const content = document.getElementById("auth-dashboard-content");
  const emailEl = document.getElementById("auth-dashboard-email");
  const tierEl = document.getElementById("auth-dashboard-tier");
  const freePanel = document.getElementById("auth-dashboard-free");
  const paidPanel = document.getElementById("auth-dashboard-paid");
  if (!content || !emailEl || !tierEl || !freePanel || !paidPanel) return;

  const tier = getSubscriptionTier(user);
  emailEl.textContent = user?.email ?? "—";
  tierEl.textContent = subscriptionTierLabel(tier);
  tierEl.classList.toggle("auth-dashboard__tier--paid", tier === "paid");
  tierEl.classList.toggle("auth-dashboard__tier--free", tier !== "paid");
  freePanel.hidden = tier === "paid";
  paidPanel.hidden = tier !== "paid";
  content.hidden = false;
}

function redirectToLogin() {
  location.assign(authLoginHref(authDashboardHref()));
}

function init() {
  if (!isAuthConfigured()) {
    showUnconfigured();
    return;
  }

  const sb = getSupabaseClient();
  if (!sb) {
    showUnconfigured();
    return;
  }

  void sb.auth.refreshSession().catch(() => {});

  void sb.auth.getSession().then(({ data: { session } }) => {
    if (!session?.user) {
      redirectToLogin();
      return;
    }
    renderDashboard(session.user);
  });

  sb.auth.onAuthStateChange((_event, session) => {
    if (!session?.user) redirectToLogin();
    else renderDashboard(session.user);
  });
}

init();
