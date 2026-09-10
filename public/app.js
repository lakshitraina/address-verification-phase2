const STATES = [
  "Karnataka",
  "Maharashtra",
  "Delhi",
  "Tamil Nadu",
  "Telangana",
  "Uttar Pradesh",
  "West Bengal",
  "Gujarat",
];

const PINCODE_REGEX = /^[1-9][0-9]{5}$/;

function populateStateDropdown(select) {
  select.innerHTML = '<option value="">Select State</option>' + STATES.map((s) => `<option value="${s}">${s}</option>`).join("");
}

function showToast(message, type) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.className = "toast" + (type === "error" ? " error" : "");
  setTimeout(() => toast.classList.add("hidden"), 2500);
}

const sameAsPermanentCheckbox = document.getElementById("same-as-permanent");
const permanentFieldset = document.getElementById("permanent-fieldset");
const currentPincodeInput = document.getElementById("current-pincode");
const currentPincodeError = document.getElementById("current-pincode-error");

if (currentPincodeInput) {
  currentPincodeInput.addEventListener("input", () => {
    const val = currentPincodeInput.value.trim();
    if (val && !PINCODE_REGEX.test(val)) {
      if (currentPincodeError) currentPincodeError.textContent = "Pincode must be exactly 6 digits (cannot start with 0)";
    } else {
      if (currentPincodeError) currentPincodeError.textContent = "";
    }
  });
}

sameAsPermanentCheckbox.addEventListener("change", () => {
  const checked = sameAsPermanentCheckbox.checked;
  const permanentInputs = permanentFieldset.querySelectorAll("input, select");
  permanentInputs.forEach((el) => (el.disabled = checked));

  if (checked) {
    document.getElementById("permanent-line1").value = document.getElementById("current-line1").value;
    document.getElementById("permanent-city").value = document.getElementById("current-city").value;
    document.getElementById("permanent-state").value = document.getElementById("current-state").value;
    document.getElementById("permanent-pincode").value = document.getElementById("current-pincode").value;
  }
});

function escapeHtml(str) {
  return String(str).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function renderSubmissions(list) {
  const tbody = document.getElementById("submissions-tbody");
  tbody.innerHTML = list
    .map((s) => {
      const cur = s.current || {};
      const perm = s.permanent || {};
      return `
        <tr>
          <td>${s.candidateId}</td>
          <td>${escapeHtml(cur.line1 ?? "")}, ${escapeHtml(cur.city ?? "")}, ${escapeHtml(cur.state ?? "")} - ${escapeHtml(cur.pincode ?? "")}</td>
          <td>${escapeHtml(perm.line1 ?? "")}, ${escapeHtml(perm.city ?? "")}, ${escapeHtml(perm.state ?? "")} - ${escapeHtml(perm.pincode ?? "")}</td>
          <td>${s.sameAsPermanent ? "Yes" : "No"}</td>
          <td>${s.matchPercent}%</td>
          <td>${s.createdAt}</td>
        </tr>`;
    })
    .join("");
}

async function loadSubmissions() {
  const res = await fetch("/api/address");
  const data = await res.json();
  renderSubmissions(data);
}

document.getElementById("address-form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const candidateId = parseInt(document.getElementById("candidateId").value, 10);
  const sameAsPermanent = sameAsPermanentCheckbox.checked;

  const current = {
    line1: document.getElementById("current-line1").value,
    city: document.getElementById("current-city").value,
    state: document.getElementById("current-state").value,
    pincode: document.getElementById("current-pincode").value,
  };
  const permanent = {
    line1: document.getElementById("permanent-line1").value,
    city: document.getElementById("permanent-city").value,
    state: document.getElementById("permanent-state").value,
    pincode: document.getElementById("permanent-pincode").value,
  };

  if (!PINCODE_REGEX.test(current.pincode.trim())) {
    if (currentPincodeError) currentPincodeError.textContent = "Pincode must be exactly 6 digits (cannot start with 0)";
    showToast("Invalid pincode", "error");
    return;
  }

  try {
    const res = await fetch("/api/address", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ candidateId, current, permanent, sameAsPermanent }),
    });

    if (res.status === 201) {
      showToast("Address submitted successfully", "success");
      if (currentPincodeError) currentPincodeError.textContent = "";
      loadSubmissions();
    } else {
      const data = await res.json().catch(() => ({}));
      showToast(data.error || "Submission failed", "error");
    }
  } catch (err) {
    showToast("Network error: failed to submit address", "error");
  }
});

// --- Interviewer/candidate tooling: reset seed data (not part of the app-under-test) ---
document.getElementById("reset-data-btn").addEventListener("click", async () => {
  await fetch("/api/reset", { method: "POST" });
  loadSubmissions();
  showToast("Data reset", "success");
});

populateStateDropdown(document.getElementById('current-state'));
populateStateDropdown(document.getElementById('permanent-state'));
loadSubmissions();
