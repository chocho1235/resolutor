import { authSignupHref, getSupabaseClient, isAuthConfigured, safeNextPath } from "./auth.js";

const params = new URLSearchParams(location.search);

function redirectIfSession() {
  const sb = getSupabaseClient();
  if (!sb) return;
  void sb.auth.getSession().then(({ data: { session } }) => {
    if (session) {
      const dest = safeNextPath(params.get("next"));
      location.assign(dest);
    }
  });
}

function wireSignupLink() {
  const el = document.getElementById("auth-login-to-signup");
  if (!el) return;
  const raw = params.get("next");
  el.href = raw ? authSignupHref(safeNextPath(raw)) : authSignupHref("");
}

function showUnconfigured() {
  const form = document.getElementById("auth-login-form");
  const note = document.getElementById("auth-login-unconfigured");
  if (form) form.hidden = true;
  if (note) {
    note.hidden = false;
    note.textContent =
      "Sign-in is not configured for this build. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY, then redeploy.";
  }
}

function init() {
  wireSignupLink();
  if (!isAuthConfigured()) {
    showUnconfigured();
    return;
  }
  redirectIfSession();

  const sb = getSupabaseClient();
  const form = document.getElementById("auth-login-form");
  const err = document.getElementById("auth-login-error");
  const submit = document.getElementById("auth-login-submit");
  if (!form || !sb) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const email = String(fd.get("email") ?? "").trim();
    const password = String(fd.get("password") ?? "");
    if (!email || !password) {
      if (err) err.textContent = "Enter your email and password.";
      return;
    }
    if (err) err.textContent = "";
    if (submit) submit.disabled = true;
    try {
      const { error } = await sb.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const dest = safeNextPath(params.get("next"));
      location.assign(dest);
    } catch (e2) {
      if (err) err.textContent = e2.message || "Something went wrong.";
    } finally {
      if (submit) submit.disabled = false;
    }
  });
}

init();
