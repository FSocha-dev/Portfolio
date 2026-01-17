document.addEventListener("DOMContentLoaded", () => {
  const nav = document.getElementById("nav-wrap");
  const navLinks = document.querySelectorAll('#nav a[href^="#"]');
  const sections = Array.from(
    document.querySelectorAll("header#home, section[id]")
  );

  const getNavHeight = () => (nav ? nav.getBoundingClientRect().height : 0);

  navLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      if (!targetId || targetId === "#") return;
      const target = document.querySelector(targetId);
      if (!target) return;

      event.preventDefault();
      const top =
        target.getBoundingClientRect().top + window.scrollY - getNavHeight() + 1;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });

  if ("IntersectionObserver" in window && sections.length) {
    // Funkcja do aktualizacji aktywnego linku
    const updateActiveLink = () => {
      const scrollPosition = window.scrollY + getNavHeight() + 150;
      const windowBottom = window.scrollY + window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      let currentSection = sections[0]; // domyślnie Home
      
      // Dla ostatniej sekcji (Contact) - sprawdź czy jesteśmy blisko dołu strony
      const lastSection = sections[sections.length - 1];
      if (lastSection && lastSection.id === 'contact') {
        const contactTop = lastSection.getBoundingClientRect().top + window.scrollY;
        const contactHeight = lastSection.offsetHeight;
        const contactBottom = contactTop + contactHeight;
        
        // Jeśli jesteśmy w ostatnich 300px strony LUB widzimy Contact na ekranie
        if (windowBottom >= documentHeight - 300 || 
            (window.scrollY >= contactTop - 200 && window.scrollY <= contactBottom)) {
          currentSection = lastSection;
        } else {
          // Normalna logika dla innych sekcji
          for (let i = sections.length - 1; i >= 0; i--) {
            const section = sections[i];
            const sectionTop = section.getBoundingClientRect().top + window.scrollY;
            
            if (scrollPosition >= sectionTop) {
              currentSection = section;
              break;
            }
          }
        }
      } else {
        // Normalna logika dla innych sekcji
        for (let i = sections.length - 1; i >= 0; i--) {
          const section = sections[i];
          const sectionTop = section.getBoundingClientRect().top + window.scrollY;
          
          if (scrollPosition >= sectionTop) {
            currentSection = section;
            break;
          }
        }
      }
      
      // Aktualizuj klasy w nawigacji
      navLinks.forEach((link) => {
        const li = link.closest("li");
        if (!li) return;
        const href = link.getAttribute("href");
        const sectionId = href === "#" ? "home" : href.substring(1);
        
        if (currentSection && currentSection.id === sectionId) {
          li.classList.add("current");
        } else {
          li.classList.remove("current");
        }
      });
    };
    
    // Obserwuj wszystkie sekcje
    const observer = new IntersectionObserver(
      (entries) => {
        updateActiveLink();
      },
      { 
        threshold: [0, 0.1, 0.5, 1],
        rootMargin: `-${getNavHeight()}px 0px -50% 0px`
      }
    );

    sections.forEach((section) => observer.observe(section));
    
    // Aktualizuj również podczas scrollowania
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateActiveLink();
          ticking = false;
        });
        ticking = true;
      }
    });
    
    // Ustaw początkową aktywną sekcję
    updateActiveLink();
  }

  const zoomTargets = document.querySelectorAll("#interests img, .profile-pic");
  if (zoomTargets.length) {
    const overlay = document.createElement("div");
    overlay.className = "image-lightbox";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-hidden", "true");

    const figure = document.createElement("figure");
    figure.className = "image-lightbox__figure";
    const image = document.createElement("img");
    image.alt = "";
    const caption = document.createElement("figcaption");
    caption.className = "image-lightbox__caption";
    const close = document.createElement("button");
    close.type = "button";
    close.className = "image-lightbox__close";
    close.setAttribute("aria-label", "Close image");
    close.textContent = "X";

    figure.append(image, caption);
    overlay.append(figure, close);
    document.body.append(overlay);

    const closeLightbox = () => {
      overlay.classList.remove("is-open");
      overlay.setAttribute("aria-hidden", "true");
      document.body.classList.remove("no-scroll");
    };

    const openLightbox = (source) => {
      image.src = source.currentSrc || source.src;
      image.alt = source.alt || "Image";
      caption.textContent = source.alt || "";
      overlay.classList.add("is-open");
      overlay.setAttribute("aria-hidden", "false");
      document.body.classList.add("no-scroll");
    };

    overlay.addEventListener("click", (event) => {
      if (event.target === overlay || event.target === close) {
        closeLightbox();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && overlay.classList.contains("is-open")) {
        closeLightbox();
      }
    });

    zoomTargets.forEach((img) => {
      img.style.cursor = "zoom-in";
      img.addEventListener("click", () => openLightbox(img));
    });

    const style = document.createElement("style");
    style.textContent = `
      .image-lightbox {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.85);
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.2s ease;
        z-index: 2000;
        padding: 24px;
      }
      .image-lightbox.is-open {
        opacity: 1;
        pointer-events: auto;
      }
      .image-lightbox__figure {
        margin: 0;
        max-width: 90vw;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 12px;
      }
      .image-lightbox__figure img {
        max-width: 90vw;
        max-height: 80vh;
        border-radius: 10px;
        box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
      }
      .image-lightbox__caption {
        color: #f1f1f1;
        font-size: 0.95rem;
        text-align: center;
      }
      .image-lightbox__close {
        position: absolute;
        top: 16px;
        right: 16px;
        width: 40px;
        height: 40px;
        border-radius: 999px;
        border: 1px solid rgba(255, 255, 255, 0.4);
        background: rgba(0, 0, 0, 0.6);
        color: #fff;
        font-size: 1rem;
        cursor: pointer;
      }
      .no-scroll {
        overflow: hidden;
      }
    `;
    document.head.append(style);
  }

  document.querySelectorAll("img").forEach((img) => {
    if (!img.hasAttribute("loading")) {
      img.setAttribute("loading", "lazy");
    }
  });
});
