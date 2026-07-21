// =========================================================================
// DESIGN FOR LEAN — Shared site behavior
// =========================================================================
(function () {
  "use strict";

  var prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Header scroll state ---------------- */
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 8) {
        header.classList.add("is-scrolled");
      } else {
        header.classList.remove("is-scrolled");
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------------- Mobile nav ---------------- */
  var navToggle = document.querySelector(".nav-toggle");
  var navClose = document.querySelector(".nav-close");
  var navLinks = document.querySelector(".nav-links");
  var body = document.body;
  var lastFocused = null;

  function getFocusable(container) {
    return Array.prototype.slice.call(
      container.querySelectorAll('a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])')
    );
  }

  function openNav() {
    if (!navLinks) return;
    lastFocused = document.activeElement;
    navLinks.setAttribute("data-open", "true");
    body.setAttribute("data-menu-open", "true");
    navToggle.setAttribute("aria-expanded", "true");
    var focusable = getFocusable(navLinks);
    if (focusable.length) focusable[0].focus();
  }

  function closeNav() {
    if (!navLinks) return;
    navLinks.setAttribute("data-open", "false");
    body.removeAttribute("data-menu-open");
    navToggle.setAttribute("aria-expanded", "false");
    if (lastFocused) lastFocused.focus();
  }

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var isOpen = navLinks.getAttribute("data-open") === "true";
      isOpen ? closeNav() : openNav();
    });
  }
  if (navClose) {
    navClose.addEventListener("click", closeNav);
  }
  if (navLinks) {
    navLinks.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", closeNav);
    });
    navLinks.addEventListener("keydown", function (e) {
      if (e.key === "Escape") {
        closeNav();
        return;
      }
      if (e.key === "Tab" && navLinks.getAttribute("data-open") === "true") {
        var focusable = getFocusable(navLinks);
        if (!focusable.length) return;
        var first = focusable[0];
        var last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    });
  }

  /* ---------------- Active nav link ---------------- */
  var currentFile = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll(".nav-links a[href]").forEach(function (a) {
    var linkFile = a.pathname.split("/").pop() || "index.html";
    if (linkFile === currentFile) {
      a.setAttribute("aria-current", "page");
    }
  });

  /* ---------------- Scroll reveal ---------------- */
  var revealEls = document.querySelectorAll("[data-reveal]");
  if (revealEls.length) {
    if (prefersReducedMotion || !("IntersectionObserver" in window)) {
      revealEls.forEach(function (el) {
        el.classList.add("is-visible");
      });
    } else {
      var io = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            if (entry.isIntersecting) {
              var el = entry.target;
              var delay = el.getAttribute("data-reveal-delay");
              if (delay) {
                el.style.transitionDelay = delay + "ms";
              }
              el.classList.add("is-visible");
              io.unobserve(el);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
      );
      revealEls.forEach(function (el) {
        io.observe(el);
      });
    }
  }

  /* ---------------- FAQ accordion ---------------- */
  document.querySelectorAll(".faq-question").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var expanded = btn.getAttribute("aria-expanded") === "true";
      var answer = document.getElementById(btn.getAttribute("aria-controls"));
      btn.setAttribute("aria-expanded", String(!expanded));
      if (answer) answer.setAttribute("data-open", String(!expanded));
    });
  });

  /* ---------------- Contact form ---------------- */
  var form = document.getElementById("contact-form");
  if (form) {
    var statusEl = document.getElementById("form-status");
    var submitBtn = form.querySelector('button[type="submit"]');

    var programField = form.querySelector("#program");
    if (programField) {
      var params = new URLSearchParams(window.location.search);
      var requestedProgram = params.get("program");
      if (requestedProgram && form.querySelector('#program option[value="' + requestedProgram + '"]')) {
        programField.value = requestedProgram;
      }
    }

    function setFieldError(field, message) {
      var wrapper = field.closest(".field");
      if (!wrapper) return;
      var errorEl = wrapper.querySelector(".field-error");
      if (message) {
        wrapper.classList.add("has-error");
        if (errorEl) errorEl.textContent = message;
        field.setAttribute("aria-invalid", "true");
      } else {
        wrapper.classList.remove("has-error");
        field.removeAttribute("aria-invalid");
      }
    }

    function validate() {
      var valid = true;
      var name = form.querySelector("#name");
      var email = form.querySelector("#email");
      var messageField = form.querySelector("#message");

      if (!name.value.trim()) {
        setFieldError(name, "Please enter your name.");
        valid = false;
      } else {
        setFieldError(name, "");
      }

      var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.value.trim() || !emailPattern.test(email.value.trim())) {
        setFieldError(email, "Please enter a valid email address.");
        valid = false;
      } else {
        setFieldError(email, "");
      }

      if (!messageField.value.trim() || messageField.value.trim().length < 10) {
        setFieldError(messageField, "Tell us a bit more (10+ characters).");
        valid = false;
      } else {
        setFieldError(messageField, "");
      }

      return valid;
    }

    function showStatus(type, message) {
      if (!statusEl) return;
      statusEl.textContent = message;
      statusEl.className = "form-status is-visible " + type;
      statusEl.setAttribute("role", type === "error" ? "alert" : "status");
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate()) {
        var firstError = form.querySelector(".has-error input, .has-error textarea");
        if (firstError) firstError.focus();
        return;
      }

      form.classList.add("is-loading");
      submitBtn.disabled = true;

      var formData = new FormData(form);
      var payload = {};
      formData.forEach(function (value, key) {
        payload[key] = value;
      });

      fetch(form.getAttribute("action"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then(function (res) {
          return res.json().then(function (data) {
            return { ok: res.ok, data: data };
          });
        })
        .then(function (result) {
          form.classList.remove("is-loading");
          submitBtn.disabled = false;
          if (result.ok && result.data.success) {
            showStatus("success", "Thanks — your message is in. A program advisor will reply within two business days.");
            form.reset();
          } else {
            showStatus("error", (result.data && result.data.message) || "Something went wrong. Please try again or email us directly.");
          }
        })
        .catch(function () {
          form.classList.remove("is-loading");
          submitBtn.disabled = false;
          showStatus("error", "We couldn't reach the server. Please check your connection or email us directly at info@designforlean.com.");
        });
    });
  }

  /* ---------------- Footer year ---------------- */
  document.querySelectorAll("[data-current-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
