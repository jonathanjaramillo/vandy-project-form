// Shared logic for faculty.html / corporate.html.
// Expects APP_CONFIG from firebase-config.js and a <form id="intake-form" data-form-type="faculty|corporate">.

(function () {
  // Wire up "if yes, explain" style conditional fields.
  // Elements tagged data-toggles="<id>" data-show-when="Yes" reveal #<id> when their value matches.
  document
    .querySelectorAll("input[type=radio][data-toggles], select[data-toggles]")
    .forEach((el) => {
      el.addEventListener("change", () => {
        const target = document.getElementById(el.dataset.toggles);
        if (!target) return;
        const currentValue =
          el.tagName === "SELECT"
            ? el.value
            : [...document.querySelectorAll(`input[name="${el.name}"]`)].find(
                (r) => r.checked
              )?.value;
        target.classList.toggle("visible", currentValue === el.dataset.showWhen);
      });
    });

  const form = document.getElementById("intake-form");
  if (!form) return;

  const formType = form.dataset.formType;
  const messageEl = document.getElementById("form-message");
  const submitBtn = form.querySelector('button[type="submit"]');

  function showMessage(text, kind) {
    messageEl.textContent = text;
    messageEl.className = kind; // "success" or "error"
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const recaptchaToken =
      typeof grecaptcha !== "undefined" ? grecaptcha.getResponse() : "";
    if (!recaptchaToken) {
      showMessage("Please complete the reCAPTCHA checkbox.", "error");
      return;
    }

    const data = {};
    new FormData(form).forEach((value, key) => {
      data[key] = value;
    });

    submitBtn.disabled = true;
    submitBtn.textContent = "Submitting...";
    showMessage("", "");

    try {
      const res = await fetch(APP_CONFIG.SUBMIT_FUNCTION_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formType, data, recaptchaToken }),
      });
      const result = await res.json();

      if (res.ok && result.success) {
        showMessage("Thank you — your submission has been received.", "success");
        form.reset();
        document
          .querySelectorAll(".conditional")
          .forEach((el) => el.classList.remove("visible"));
        if (typeof grecaptcha !== "undefined") grecaptcha.reset();
      } else {
        showMessage(result.error || "Something went wrong. Please try again.", "error");
        if (typeof grecaptcha !== "undefined") grecaptcha.reset();
      }
    } catch (err) {
      showMessage("Network error — please try again.", "error");
      if (typeof grecaptcha !== "undefined") grecaptcha.reset();
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = "Submit";
    }
  });
})();
