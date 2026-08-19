(function () {
  // Already logged in? Skip straight to the right dashboard.
  const existing = TMS.getUser();
  if (existing) {
    window.location.href = TMS.dashboardForRole(existing.role);
    return;
  }

  if (TMS.qs("sessionExpired")) {
    TMS.showAlert("loginAlert", "Your session expired. Please log in again.", "warning");
  }

  const form = document.getElementById("loginForm");
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    TMS.clearAlert("loginAlert");

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const submitBtn = document.getElementById("loginSubmit");
    submitBtn.disabled = true;

    try {
      const res = await TMS.apiFetch("/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      TMS.setSession(res.data.user, res.data.token);
      window.location.href = TMS.dashboardForRole(res.data.user.role);
    } catch (err) {
      TMS.showAlert("loginAlert", TMS.errorMessage(err));
      submitBtn.disabled = false;
    }
  });
})();
