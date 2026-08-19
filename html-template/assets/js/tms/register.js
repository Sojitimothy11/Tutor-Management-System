(function () {
  const existing = TMS.getUser();
  if (existing) {
    window.location.href = TMS.dashboardForRole(existing.role);
    return;
  }

  const form = document.getElementById("registerForm");
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    TMS.clearAlert("registerAlert");

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (password !== confirmPassword) {
      TMS.showAlert("registerAlert", "Passwords do not match");
      return;
    }

    const submitBtn = document.getElementById("registerSubmit");
    submitBtn.disabled = true;

    try {
      const res = await TMS.apiFetch("/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      TMS.setSession(res.data.user, res.data.token);
      window.location.href = TMS.dashboardForRole(res.data.user.role);
    } catch (err) {
      TMS.showAlert("registerAlert", TMS.errorMessage(err));
      submitBtn.disabled = false;
    }
  });
})();
