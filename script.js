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

    document.querySelector(".swap").addEventListener("click", () => {
      document.querySelector("[data-stage-panel='private']").classList.toggle("reverse");
    });

    document.querySelectorAll(".route-form .btn").forEach((button) => {
      button.addEventListener("click", () => {
        const panel = document.querySelector(".result-panel");
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

    document.querySelector(".question-form .btn").addEventListener("click", (event) => {
      event.currentTarget.textContent = "Запит відправлено";
    });
