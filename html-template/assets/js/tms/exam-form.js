(function () {
  const form = document.getElementById("examForm");
  const submitBtn = document.getElementById("examSubmit");
  const subjectSelect = document.getElementById("subjectId");
  const id = TMS.qs("id");

  async function loadSubjects() {
    try {
      const res = await TMS.apiFetch("/subjects?limit=100");
      res.data.forEach((s) => {
        const opt = document.createElement("option");
        opt.value = s.id;
        opt.textContent = s.name + " (" + s.code + ")";
        subjectSelect.appendChild(opt);
      });
    } catch (err) {
      TMS.showAlert("examFormAlert", TMS.errorMessage(err));
    }
  }

  async function prefill() {
    if (!id) return;
    try {
      const res = await TMS.apiFetch("/exams/" + id);
      const ex = res.data;
      document.getElementById("name").value = ex.name;
      document.getElementById("totalMarks").value = ex.totalMarks;
      document.getElementById("passingMarks").value = ex.passingMarks;
      document.getElementById("examDate").value = new Date(ex.examDate).toISOString().slice(0, 10);
      if (ex.subject) subjectSelect.value = ex.subject.id;
    } catch (err) {
      TMS.showAlert("examFormAlert", TMS.errorMessage(err));
    }
  }

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    TMS.clearAlert("examFormAlert");

    const payload = {
      name: document.getElementById("name").value.trim(),
      subjectId: Number(subjectSelect.value),
      totalMarks: Number(document.getElementById("totalMarks").value),
      passingMarks: Number(document.getElementById("passingMarks").value),
      examDate: document.getElementById("examDate").value,
    };

    submitBtn.disabled = true;
    try {
      if (id) {
        await TMS.apiFetch("/exams/" + id, { method: "PATCH", body: JSON.stringify(payload) });
      } else {
        await TMS.apiFetch("/exams", { method: "POST", body: JSON.stringify(payload) });
      }
      window.location.href = "exam.html";
    } catch (err) {
      TMS.showAlert("examFormAlert", TMS.errorMessage(err));
      submitBtn.disabled = false;
    }
  });

  loadSubjects().then(prefill);
})();
