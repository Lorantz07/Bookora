/* ==========================================================================
   Bookora — shared interface behaviour
   Native dialogs, mobile navigation, year stamp, and small accessibility
   details used across every page.
   ========================================================================== */

(function () {
  "use strict";

  const page = document.documentElement;
  const dialogs = Array.from(document.querySelectorAll("dialog"));

  function syncScrollLock() {
    const hasOpenDialog = document.querySelector("dialog[open]") !== null;
    page.classList.toggle("has-open-dialog", hasOpenDialog);
  }

  function syncExpandedState(dialogId, isOpen) {
    document.querySelectorAll('[data-dialog-open="' + dialogId + '"]').forEach(function (trigger) {
      if (trigger.hasAttribute("aria-expanded")) {
        trigger.setAttribute("aria-expanded", String(isOpen));
      }
    });
  }

  function openDialog(dialog, trigger) {
    if (!dialog || typeof dialog.showModal !== "function") {
      return;
    }

    dialog.showModal();
    syncScrollLock();
    syncExpandedState(dialog.id, true);

    window.requestAnimationFrame(function () {
      const preferredField = dialog.querySelector("input[type='search']");
      const fallbackTarget = dialog.querySelector("[data-dialog-close]");
      const target = preferredField || fallbackTarget;

      if (target) {
        target.focus({ preventScroll: true });
      }
    });
  }

  document.querySelectorAll("[data-dialog-open]").forEach(function (trigger) {
    trigger.addEventListener("click", function () {
      const dialog = document.getElementById(trigger.dataset.dialogOpen);
      openDialog(dialog, trigger);
    });
  });

  dialogs.forEach(function (dialog) {
    dialog.addEventListener("click", function (event) {
      if (event.target !== dialog) {
        return;
      }

      const bounds = dialog.getBoundingClientRect();
      const clickedInside =
        event.clientX >= bounds.left &&
        event.clientX <= bounds.right &&
        event.clientY >= bounds.top &&
        event.clientY <= bounds.bottom;

      if (!clickedInside) {
        dialog.close();
      }
    });

    dialog.addEventListener("close", function () {
      syncScrollLock();
      syncExpandedState(dialog.id, false);
    });

    dialog.querySelectorAll("[data-dialog-close]").forEach(function (closeButton) {
      closeButton.addEventListener("click", function () {
        dialog.close();
      });
    });
  });

  document.querySelectorAll("[data-current-year]").forEach(function (yearNode) {
    yearNode.textContent = String(new Date().getFullYear());
  });
})();
