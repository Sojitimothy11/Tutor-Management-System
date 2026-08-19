(function () {
  const form = document.getElementById("feePaymentForm");
  const submitBtn = document.getElementById("feePaymentSubmit");
  const studentSelect = document.getElementById("studentId");
  const feeStructureSelect = document.getElementById("feeStructureId");

  async function loadOptions() {
    try {
      const [students, fees] = await Promise.all([
        TMS.apiFetch("/students?limit=200"),
        TMS.apiFetch("/fees?limit=100"),
      ]);
      students.data.forEach((s) => {
        const opt = document.createElement("option");
        opt.value = s.id;
        opt.textContent = s.admissionNo + " - " + s.firstName + " " + s.lastName;
        studentSelect.appendChild(opt);
      });
      fees.data.forEach((f) => {
        const opt = document.createElement("option");
        opt.value = f.id;
        opt.textContent = f.name + " (" + f.academicYear + ") - " + f.amount;
        feeStructureSelect.appendChild(opt);
      });
    } catch (err) {
      TMS.showAlert("feePaymentFormAlert", TMS.errorMessage(err));
    }
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    TMS.clearAlert("feePaymentFormAlert");

    const payload = {
      studentId: Number(studentSelect.value),
      feeStructureId: Number(feeStructureSelect.value),
      amountPaid: Number(document.getElementById("amountPaid").value),
      status: document.getElementById("status").value,
    };
    const paymentMethod = document.getElementById("paymentMethod").value.trim();
    if (paymentMethod) payload.paymentMethod = paymentMethod;
    const paymentDate = document.getElementById("paymentDate").value;
    if (paymentDate) payload.paymentDate = paymentDate;

    submitBtn.disabled = true;
    try {
      await TMS.apiFetch("/fee-payments", { method: "POST", body: JSON.stringify(payload) });
      window.location.href = "fees-collections.html";
    } catch (err) {
      TMS.showAlert("feePaymentFormAlert", TMS.errorMessage(err));
      submitBtn.disabled = false;
    }
  });

  loadOptions();
})();
