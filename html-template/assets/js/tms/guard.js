/**
 * Include this on every page that requires a logged-in user (i.e. every
 * page except login/register/forgot-password). Must load after api.js.
 */
(function () {
  const user = TMS.getUser();
  const token = TMS.getToken();

  if (!user || !token) {
    window.location.href = "login.html";
    return;
  }

  document.addEventListener("DOMContentLoaded", function () {
    // Fill in the "Ryan Taylor / Administrator" placeholder in the topbar
    // dropdown with the real logged-in user, wherever that markup exists.
    document.querySelectorAll(".user-header .user-text h6").forEach((el) => {
      el.textContent = user.name;
    });
    document.querySelectorAll(".user-header .user-text p").forEach((el) => {
      el.textContent = user.role;
    });
    document.querySelectorAll(".user-menu .user-img img").forEach((el) => {
      el.alt = user.name;
    });
  });

  // Delegated handler: any "Logout" link (as used throughout the template)
  // clears the session instead of just navigating to login.html.
  document.addEventListener("click", function (e) {
    const link = e.target.closest("a");
    if (!link) return;
    if (link.getAttribute("href") === "login.html" && /logout/i.test(link.textContent)) {
      e.preventDefault();
      TMS.clearSession();
      window.location.href = "login.html";
    }
  });

  window.TMS_CURRENT_USER = user;
})();
