(function () {
  function set(fieldId, value) {
    const el = document.getElementById(fieldId);
    if (el) el.textContent = value === null || value === undefined || value === "" ? "-" : value;
  }

  async function loadProfile() {
    try {
      const res = await TMS.apiFetch("/auth/me");
      const u = res.data;
      const profile = u.student || u.teacher || null;

      set("profile-name", u.name);
      set("profile-role", u.role);
      set("profile-email", u.email);
      set("profile-name-2", u.name);
      set("profile-email-2", u.email);
      set("profile-role-2", u.role);
      set("profile-joined", TMS.formatDate(u.createdAt));

      if (profile) {
        set("profile-phone", profile.phone);
        set("profile-address", profile.address);
        set("profile-status-btn", profile.status === "ACTIVE" ? "Active" : "Inactive");
        set("profile-dept-value", profile.department ? profile.department.name : "-");
        if (u.student) {
          set("profile-id-label", "Admission No");
          set("profile-id-value", profile.admissionNo);
        } else {
          set("profile-id-label", "Employee ID");
          set("profile-id-value", profile.employeeId);
        }
      } else {
        set("profile-phone", "-");
        set("profile-address", "-");
        set("profile-status-btn", "Active");
        set("profile-id-label", "Account Type");
        set("profile-id-value", "Administrator");
        set("profile-dept-label", "Department");
        set("profile-dept-value", "-");
      }
    } catch (err) {
      TMS.showAlert("profileAlert", TMS.errorMessage(err));
    }
  }

  const form = document.getElementById("changePasswordForm");
  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    TMS.clearAlert("passwordFormAlert");

    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmNewPassword = document.getElementById("confirmNewPassword").value;

    if (newPassword !== confirmNewPassword) {
      TMS.showAlert("passwordFormAlert", "New passwords do not match");
      return;
    }

    const submitBtn = document.getElementById("changePasswordSubmit");
    submitBtn.disabled = true;
    try {
      await TMS.apiFetch("/auth/change-password", {
        method: "PATCH",
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      TMS.showAlert("passwordFormAlert", "Password updated successfully", "success");
      form.reset();
    } catch (err) {
      TMS.showAlert("passwordFormAlert", TMS.errorMessage(err));
    } finally {
      submitBtn.disabled = false;
    }
  });

  loadProfile();
})();
