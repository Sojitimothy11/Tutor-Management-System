/**
 * TMS frontend runtime: talks to the backend in ../../backend.
 * Loaded on every page, before guard.js and any page-specific script.
 */
(function (window) {
  const API_BASE_URL = "http://localhost:5000/api";
  const TOKEN_KEY = "tms_token";
  const USER_KEY = "tms_user";

  function getToken() {
    return localStorage.getItem(TOKEN_KEY);
  }

  function getUser() {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  }

  function setSession(user, token) {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  // Redirect target after login, based on role.
  function dashboardForRole(role) {
    if (role === "ADMIN") return "index.html";
    if (role === "TEACHER") return "teacher-dashboard.html";
    return "student-dashboard.html";
  }

  /**
   * Thin fetch wrapper: adds the API base URL + auth header, parses JSON,
   * and throws an Error (with .details from the API when present) on any
   * non-2xx response so callers can just try/catch.
   */
  async function apiFetch(path, options = {}) {
    const headers = Object.assign(
      { "Content-Type": "application/json" },
      options.headers || {}
    );
    const token = getToken();
    if (token) headers.Authorization = "Bearer " + token;

    const res = await fetch(API_BASE_URL + path, Object.assign({}, options, { headers }));

    if (res.status === 204) return null;

    let body = null;
    try {
      body = await res.json();
    } catch (e) {
      // no body
    }

    if (!res.ok) {
      if (res.status === 401) {
        clearSession();
        window.location.href = "login.html?sessionExpired=1";
        return new Promise(() => {}); // stop further handling; we're navigating away
      }
      const message = (body && body.message) || res.statusText || "Request failed";
      const err = new Error(message);
      err.status = res.status;
      err.details = body && body.details;
      throw err;
    }

    return body;
  }

  function qs(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function escapeHtml(str) {
    if (str === null || str === undefined) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function formatDate(value) {
    if (!value) return "-";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "-";
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  }

  // Renders a dismissible Bootstrap alert into a container element (or id string).
  function showAlert(container, message, type = "danger") {
    const el = typeof container === "string" ? document.getElementById(container) : container;
    if (!el) {
      console.error(message);
      return;
    }
    el.innerHTML =
      '<div class="alert alert-' +
      type +
      ' alert-dismissible fade show" role="alert">' +
      escapeHtml(message) +
      '<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
      "</div>";
  }

  function clearAlert(container) {
    const el = typeof container === "string" ? document.getElementById(container) : container;
    if (el) el.innerHTML = "";
  }

  // Formats a Zod validation-error `details` array (or falls back to the message).
  function errorMessage(err) {
    if (err && Array.isArray(err.details) && err.details.length) {
      return err.details.map((d) => (d.path ? d.path + ": " + d.message : d.message)).join("; ");
    }
    return (err && err.message) || "Something went wrong";
  }

  window.TMS = {
    apiFetch,
    getToken,
    getUser,
    setSession,
    clearSession,
    dashboardForRole,
    qs,
    escapeHtml,
    formatDate,
    showAlert,
    clearAlert,
    errorMessage,
  };
})(window);
