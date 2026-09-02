    const euQuoteForm = document.querySelector("[data-eu-quote-form]");

    if (euQuoteForm) {
      const panels = Array.from(euQuoteForm.querySelectorAll("[data-eu-panel]"));
      const steps = Array.from(euQuoteForm.querySelectorAll("[data-eu-step]"));
      const submitButton = euQuoteForm.querySelector("[data-eu-submit]");
      const submitNote = euQuoteForm.querySelector("[data-eu-submit-note]");
      let currentStep = 1;

      const showEuStep = (step) => {
        currentStep = step;
        panels.forEach((panel) => {
          const isActive = Number(panel.dataset.euPanel) === currentStep;
          panel.hidden = !isActive;
          panel.classList.toggle("is-active", isActive);
        });
        steps.forEach((item) => {
          const itemStep = Number(item.dataset.euStep);
          item.classList.toggle("is-active", itemStep === currentStep);
          item.classList.toggle("is-complete", itemStep < currentStep);
        });
      };

      euQuoteForm.querySelectorAll("[data-eu-next]").forEach((button) => {
        button.addEventListener("click", () => {
          const panel = button.closest("[data-eu-panel]");
          const invalidField = Array.from(panel?.querySelectorAll("input[required], select[required]") || [])
            .find((field) => !field.checkValidity());

          if (invalidField) {
            invalidField.reportValidity();
            return;
          }

          showEuStep(Number(button.dataset.euNext));
        });
      });

      euQuoteForm.querySelectorAll("[data-eu-prev]").forEach((button) => {
        button.addEventListener("click", () => showEuStep(Number(button.dataset.euPrev)));
      });

      euQuoteForm.addEventListener("submit", (event) => {
        event.preventDefault();
        const activePanel = panels.find((panel) => Number(panel.dataset.euPanel) === currentStep);
        const invalidField = Array.from(activePanel?.querySelectorAll("input[required], select[required]") || [])
          .find((field) => !field.checkValidity());

        if (invalidField) {
          invalidField.reportValidity();
          return;
        }

        if (submitButton) {
          submitButton.textContent = "Запит надіслано";
          submitButton.disabled = true;
        }

        if (submitNote) {
          submitNote.hidden = false;
        }
      });

      showEuStep(1);
    }

document.querySelectorAll("[data-current-year]").forEach((node) => {
      node.textContent = new Date().getFullYear();
    });

    const trustBadge = document.querySelector(".trust-badge");

    if (trustBadge && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const routeDirections = ["Ірландія → Україна", "Україна → Ірландія"];
      const routeCycleMs = 14000;
      let routeDirectionIndex = 0;

      trustBadge.textContent = routeDirections[routeDirectionIndex];

      window.setInterval(() => {
        routeDirectionIndex = (routeDirectionIndex + 1) % routeDirections.length;
        trustBadge.classList.add("is-changing");

        window.setTimeout(() => {
          trustBadge.textContent = routeDirections[routeDirectionIndex];
          trustBadge.classList.remove("is-changing");
        }, 160);
      }, routeCycleMs);
    }

    const menuToggle = document.querySelector(".menu-toggle");
    const primaryNav = document.querySelector("#primary-nav");

    if (menuToggle && primaryNav) {
      const closeMenu = () => {
        primaryNav.classList.remove("is-open");
        menuToggle.setAttribute("aria-expanded", "false");
        menuToggle.setAttribute("aria-label", "Відкрити меню");
      };

      menuToggle.addEventListener("click", () => {
        const isOpen = primaryNav.classList.toggle("is-open");
        menuToggle.setAttribute("aria-expanded", String(isOpen));
        menuToggle.setAttribute("aria-label", isOpen ? "Закрити меню" : "Відкрити меню");
      });

      primaryNav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", closeMenu);
      });

      document.addEventListener("click", (event) => {
        if (!(event.target instanceof Element) || !event.target.closest(".site-header")) {
          closeMenu();
        }
      });

      document.addEventListener("keydown", (event) => {
        if (event.key === "Escape") {
          closeMenu();
        }
      });

      window.addEventListener("resize", () => {
        if (window.innerWidth > 820) {
          closeMenu();
        }
      });
    }

    const tabs = document.querySelectorAll("[data-stage-tab]");
    const bookingPanels = document.querySelectorAll("[data-stage-panel]");
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => {
        const targetStage = tab.dataset.stageTab;
        tabs.forEach((item) => item.setAttribute("aria-selected", "false"));
        tab.setAttribute("aria-selected", "true");
        bookingPanels.forEach((panel) => {
          const isActive = panel.dataset.stagePanel === targetStage;
          panel.classList.toggle("is-active", isActive);
          panel.hidden = !isActive;
        });
      });
    });

    const reviewsTrack = document.querySelector(".reviews");
    const reviewsViewport = document.querySelector(".reviews-viewport");
    const reviewsDots = document.querySelector(".dots");
    const reviewPrev = document.querySelector(".slider-btn.prev");
    const reviewNext = document.querySelector(".slider-btn.next");

    if (reviewsTrack && reviewsViewport && reviewsDots && reviewPrev && reviewNext) {
      const reviewCards = Array.from(reviewsTrack.querySelectorAll(".review-card"));
      let reviewIndex = 0;
      let pointerStartX = 0;
      let reviewTimer = 0;
      const reviewInterval = 30000;

      reviewCards.forEach((card) => {
        const clone = card.cloneNode(true);
        clone.classList.add("is-clone");
        clone.setAttribute("aria-hidden", "true");
        reviewsTrack.appendChild(clone);
      });

      const reviewDotButtons = reviewCards.map((_, index) => {
        const dot = document.createElement("button");
        dot.className = "dot";
        dot.type = "button";
        dot.setAttribute("aria-label", `Показати відгук ${index + 1}`);
        reviewsDots.appendChild(dot);
        return dot;
      });

      const getReviewStep = () => {
        const firstCard = reviewsTrack.querySelector(".review-card");
        const styles = window.getComputedStyle(reviewsTrack);
        const gap = parseFloat(styles.columnGap || styles.gap) || 0;
        return firstCard ? firstCard.getBoundingClientRect().width + gap : 0;
      };

      const updateReviews = () => {
        reviewsTrack.style.transform = `translateX(-${getReviewStep() * reviewIndex}px)`;
        reviewCards.forEach((card, index) => {
          card.classList.toggle("is-active", index === reviewIndex);
        });
        reviewDotButtons.forEach((dot, index) => {
          const isActive = index === reviewIndex;
          dot.classList.toggle("active", isActive);
          if (isActive) {
            dot.setAttribute("aria-current", "true");
          } else {
            dot.removeAttribute("aria-current");
          }
        });
      };

      const setReview = (index) => {
        reviewIndex = (index + reviewCards.length) % reviewCards.length;
        updateReviews();
      };

      const startReviewAutoplay = () => {
        window.clearInterval(reviewTimer);
        reviewTimer = window.setInterval(() => {
          setReview(reviewIndex + 1);
        }, reviewInterval);
      };

      const moveReview = (index) => {
        setReview(index);
        startReviewAutoplay();
      };

      reviewDotButtons.forEach((dot, index) => {
        dot.addEventListener("click", () => moveReview(index));
      });

      reviewPrev.addEventListener("click", () => moveReview(reviewIndex - 1));
      reviewNext.addEventListener("click", () => moveReview(reviewIndex + 1));

      reviewsViewport.addEventListener("pointerdown", (event) => {
        pointerStartX = event.clientX;
      });

      reviewsViewport.addEventListener("pointerup", (event) => {
        const delta = event.clientX - pointerStartX;
        if (Math.abs(delta) > 42) {
          moveReview(reviewIndex + (delta < 0 ? 1 : -1));
        }
      });

      window.addEventListener("resize", updateReviews);
      updateReviews();
      startReviewAutoplay();
    }

    const parsePositiveNumber = (input) => {
      const value = Number.parseFloat(input?.value || "");
      return Number.isFinite(value) && value > 0 ? value : 0;
    };

    const formatKg = (value) => `${value.toFixed(2)} кг`;

    const formatRoutePrice = (billableWeight) => {
      if (!billableWeight) {
        return "від 25 EUR";
      }

      const extraWeight = Math.max(0, Math.ceil(billableWeight - 2));
      const price = 25 + extraWeight * 3;
      return `${price.toFixed(2)} EUR`;
    };

    const setupParcelCalculator = (root, inputAttr, outputAttr) => {
      if (!root) {
        return;
      }

      const field = (name) => root.querySelector(`[${inputAttr}="${name}"]`);
      const output = (name) => root.querySelector(`[${outputAttr}="${name}"]`);

      const update = () => {
        const weight = parsePositiveNumber(field("weight"));
        const length = parsePositiveNumber(field("length"));
        const width = parsePositiveNumber(field("width"));
        const height = parsePositiveNumber(field("height"));
        const quantity = Math.max(1, Math.floor(parsePositiveNumber(field("quantity")) || 1));
        const volumeWeight = length && width && height ? (length * width * height) / 5000 : 0;
        const billableWeight = Math.max(weight, volumeWeight) * quantity;

        if (output("volume")) {
          output("volume").textContent = formatKg(volumeWeight * quantity);
        }

        if (output("billable")) {
          output("billable").textContent = formatKg(billableWeight);
        }

        if (output("price")) {
          output("price").textContent = formatRoutePrice(billableWeight);
        }
      };

      root.querySelectorAll(`[${inputAttr}]`).forEach((input) => {
        input.addEventListener("input", update);
      });

      update();

      return { field, update };
    };

    const routeEircodeForm = document.querySelector("[data-route-eircode-form]");

    if (routeEircodeForm) {
      const eircodeInput = routeEircodeForm.querySelector("[data-route-eircode-input]");
      const calculator = document.querySelector("#calculator");

      routeEircodeForm.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!eircodeInput?.value.trim()) {
          eircodeInput?.focus();
          return;
        }

        calculator?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    const routeWeightForm = document.querySelector("[data-route-weight-form]");

    if (routeWeightForm) {
      const weightInput = routeWeightForm.querySelector("[data-route-weight-input]");
      const calculator = document.querySelector("#calculator");
      const calculatorWeight = calculator?.querySelector('[data-simple-calc-field="weight"]');

      routeWeightForm.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!weightInput?.checkValidity()) {
          weightInput?.reportValidity();
          return;
        }

        if (calculatorWeight) {
          calculatorWeight.value = weightInput.value;
          calculatorWeight.dispatchEvent(new Event("input", { bubbles: true }));
        }

        calculator?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    const documentsRouteForm = document.querySelector("[data-documents-route-form]");

    if (documentsRouteForm) {
      const routeOutput = document.querySelector("[data-documents-route-output]");
      const questionSection = document.querySelector("#question");
      const routeInputs = Array.from(documentsRouteForm.querySelectorAll('input[name="documents-route"]'));
      const requestedRoute = new URLSearchParams(window.location.search).get("route");
      const requestedRouteLabel = {
        "ie-ua": "Ірландія → Україна",
        "ua-ie": "Україна → Ірландія"
      }[requestedRoute];

      if (requestedRouteLabel) {
        routeInputs.forEach((input) => {
          input.checked = input.value === requestedRouteLabel;
        });
      }

      const syncDocumentsRoute = () => {
        const selectedRoute = routeInputs.find((input) => input.checked)?.value || "Ірландія → Україна";
        documentsRouteForm.dataset.selectedRoute = selectedRoute;
        if (routeOutput) {
          routeOutput.setAttribute("value", selectedRoute);
          routeOutput.value = selectedRoute;
        }
      };

      routeInputs.forEach((input) => {
        input.addEventListener("change", syncDocumentsRoute);
      });

      documentsRouteForm.addEventListener("submit", (event) => {
        event.preventDefault();
        syncDocumentsRoute();
        questionSection?.scrollIntoView({ behavior: "smooth", block: "start" });
      });

      syncDocumentsRoute();
    }

    const routeWizard = document.querySelector("[data-route-wizard]");

    if (routeWizard) {
      const wizardPanels = Array.from(routeWizard.querySelectorAll("[data-wizard-panel]"));
      const wizardSteps = Array.from(routeWizard.querySelectorAll("[data-wizard-step]"));
      const eircodeField = routeWizard.querySelector("[data-eircode-field]");
      const eircodeSummary = routeWizard.querySelector("[data-eircode-summary]");
      let currentWizardStep = 1;

      const setWizardStep = (step) => {
        currentWizardStep = step;

        wizardPanels.forEach((panel) => {
          const isActive = Number(panel.dataset.wizardPanel) === currentWizardStep;
          panel.classList.toggle("is-active", isActive);
          panel.hidden = !isActive;
        });

        wizardSteps.forEach((item) => {
          const itemStep = Number(item.dataset.wizardStep);
          item.classList.toggle("is-active", itemStep === currentWizardStep);
          item.classList.toggle("is-complete", itemStep < currentWizardStep);
        });
      };

      routeWizard.querySelectorAll("[data-wizard-next]").forEach((button) => {
        button.addEventListener("click", () => {
          const currentPanel = button.closest("[data-wizard-panel]");
          const invalidField = Array.from(currentPanel?.querySelectorAll("input[required]") || [])
            .find((input) => !input.checkValidity());

          if (invalidField) {
            invalidField.reportValidity();
            return;
          }

          if (currentWizardStep === 1 && eircodeSummary) {
            const eircode = eircodeField?.value.trim().toUpperCase();
            eircodeSummary.textContent = eircode ? `${eircode}: заявку можна продовжити` : "Eircode буде перевірено";
          }

          setWizardStep(Number(button.dataset.wizardNext));
        });
      });

      routeWizard.querySelectorAll("[data-wizard-prev]").forEach((button) => {
        button.addEventListener("click", () => {
          setWizardStep(Number(button.dataset.wizardPrev));
        });
      });

      const routeSubmit = routeWizard.querySelector("[data-route-submit]");
      const routeSubmitNote = routeWizard.querySelector("[data-route-submit-note]");

      routeWizard.addEventListener("submit", (event) => {
        event.preventDefault();

        if (!routeWizard.checkValidity()) {
          routeWizard.reportValidity();
          return;
        }

        if (routeSubmit) {
          routeSubmit.textContent = "Заявку відправлено";
          routeSubmit.disabled = true;

          if (routeSubmitNote) {
            routeSubmitNote.hidden = false;
          }
        }
      });

      routeWizard.addEventListener("route:continue", () => {
        setWizardStep(3);
      });

      setupParcelCalculator(routeWizard, "data-calc-field", "data-calc-output");
    }

    const simpleCalculator = document.querySelector("[data-simple-calculator]");
    const simpleCalculatorApi = setupParcelCalculator(simpleCalculator, "data-simple-calc-field", "data-simple-calc-output");

    if (simpleCalculator && simpleCalculatorApi) {
      const calculateButton = simpleCalculator.querySelector("[data-simple-calc-submit]");
      const result = simpleCalculator.querySelector("[data-simple-calc-result]");

      calculateButton?.addEventListener("click", () => {
        const requiredFields = ["weight", "length", "width", "height"];
        const firstEmptyField = requiredFields
          .map((name) => simpleCalculatorApi.field(name))
          .find((input) => !parsePositiveNumber(input));

        if (firstEmptyField) {
          firstEmptyField.focus();
          return;
        }

        simpleCalculatorApi.update();

        if (result) {
          result.hidden = false;
        }
      });
    }

    document.querySelectorAll("[data-scroll-to-wizard]").forEach((button) => {
      button.addEventListener("click", () => {
        if (routeWizard && simpleCalculator) {
          ["weight", "length", "width", "height"].forEach((name) => {
            const source = simpleCalculator.querySelector(`[data-simple-calc-field="${name}"]`);
            const target = routeWizard.querySelector(`[data-calc-field="${name}"]`);

            if (source?.value && target) {
              target.value = source.value;
              target.dispatchEvent(new Event("input", { bubbles: true }));
            }
          });

          routeWizard.dispatchEvent(new CustomEvent("route:continue"));
        }

        const routeLeadTarget = routeWizard || routeEircodeForm;
        routeLeadTarget?.scrollIntoView({ behavior: "smooth", block: "center" });
      });
    });

    document.querySelectorAll("[data-scroll-to-question]").forEach((button) => {
      button.addEventListener("click", () => {
        document.querySelector("#question")?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    });

    const swapButton = document.querySelector(".swap");
    const privatePanel = document.querySelector("[data-stage-panel='private']");

    if (swapButton && privatePanel) {
      swapButton.addEventListener("click", () => {
        privatePanel.classList.toggle("reverse");
      });
    }

    document.querySelectorAll(".route-form .btn").forEach((button) => {
      button.addEventListener("click", () => {
        const panel = document.querySelector(".result-panel");
        if (!panel) {
          return;
        }

        const form = button.closest(".route-form");
        const stage = button.closest("[data-stage-panel]")?.dataset.stagePanel;
        const title = panel.querySelector(".result-status h2");
        const text = panel.querySelector(".result-status p");

        const resultCopy = {
          private: ["Дані прийнято", "Ми перевіримо напрямок, вагу та доступний формат доставки."],
          documents: ["Код прийнято до перевірки", "Наступна дія залежатиме від напрямку та введеного коду."],
          eu: ["Запит для ЄС прийнято", "Ми уточнимо маршрут і вартість доставки до країни отримання."],
          commercial: ["Запит для B2B прийнято", "Ми погодимо умови, документи та формат регулярної доставки."]
        };

        if (title && text && resultCopy[stage]) {
          title.textContent = resultCopy[stage][0];
          text.textContent = resultCopy[stage][1];
        }

        if (title && text && form?.dataset.route === "ie-ua") {
          title.textContent = "Eircode перевірено";
          text.textContent = "Ми обслуговуємо вашу зону";
        }

        panel.scrollIntoView({ behavior: "smooth", block: "center" });
        panel.animate(
          [
            { boxShadow: "0 0 0 0 rgba(76, 175, 80, 0)" },
            { boxShadow: "0 0 0 8px rgba(76, 175, 80, 0.16)" },
            { boxShadow: "0 0 0 0 rgba(76, 175, 80, 0)" }
          ],
          { duration: 900, easing: "ease-out" }
        );
      });
    });

    document.querySelectorAll(".question-form .btn").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.currentTarget.textContent = "Запит відправлено";
      });
    });

    const packingJumpLinks = Array.from(document.querySelectorAll(".packing-jump a[href^='#']"));

    if (packingJumpLinks.length) {
      const packingSections = packingJumpLinks
        .map((link) => document.querySelector(link.getAttribute("href")))
        .filter(Boolean);
      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let packingScrollFrame = 0;

      const setActivePackingSection = (sectionId) => {
        packingJumpLinks.forEach((link) => {
          if (link.getAttribute("href") === `#${sectionId}`) {
            link.setAttribute("aria-current", "location");
          } else {
            link.removeAttribute("aria-current");
          }
        });
      };

      const updateActivePackingSection = () => {
        const marker = window.innerWidth > 700 ? 92 : 48;
        let currentSection = packingSections[0];

        packingSections.forEach((section) => {
          if (section.getBoundingClientRect().top <= marker) {
            currentSection = section;
          }
        });

        if (currentSection) {
          setActivePackingSection(currentSection.id);
        }
      };

      packingJumpLinks.forEach((link) => {
        link.addEventListener("click", (event) => {
          const target = document.querySelector(link.getAttribute("href"));

          if (!target) {
            return;
          }

          event.preventDefault();
          setActivePackingSection(target.id);
          target.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "start" });
          window.history.replaceState(null, "", `#${target.id}`);
        });
      });

      window.addEventListener("scroll", () => {
        if (packingScrollFrame) {
          return;
        }

        packingScrollFrame = window.requestAnimationFrame(() => {
          updateActivePackingSection();
          packingScrollFrame = 0;
        });
      }, { passive: true });

      updateActivePackingSection();
    }

    const backToTopButton = document.querySelector("[data-back-to-top]");

    if (backToTopButton) {
      const reduceBackToTopMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      let backToTopFrame = 0;

      const updateBackToTopButton = () => {
        const isVisible = window.scrollY > 640;
        backToTopButton.classList.toggle("is-visible", isVisible);
        backToTopButton.setAttribute("aria-hidden", String(!isVisible));
        backToTopButton.tabIndex = isVisible ? 0 : -1;
      };

      window.addEventListener("scroll", () => {
        if (backToTopFrame) {
          return;
        }

        backToTopFrame = window.requestAnimationFrame(() => {
          updateBackToTopButton();
          backToTopFrame = 0;
        });
      }, { passive: true });

      backToTopButton.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: reduceBackToTopMotion ? "auto" : "smooth" });
      });

      updateBackToTopButton();
    }
