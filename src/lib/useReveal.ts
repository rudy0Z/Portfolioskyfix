import { useEffect } from "react";

/**
 * Scroll-reveal engine. One IntersectionObserver per route render: every
 * [data-reveal] element gets `.is-in` the first time it crosses the lower
 * ~8% of the viewport. CSS carries all motion (transform + opacity only);
 * this just toggles a class, so it costs nothing per frame.
 *
 * Stagger by setting `style={{ "--rd": n }}` on the element (n = step index).
 */
export function useReveal(dep: unknown) {
  useEffect(() => {
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]"));
    if (!els.length) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      els.forEach((el) => el.classList.add("is-in"));
      return;
    }

    const revealIfVisible = () => {
      const vh = window.innerHeight || 900;
      for (const el of els) {
        if (el.classList.contains("is-in")) continue;
        const rect = el.getBoundingClientRect();
        if (rect.top < vh * 1.02 && rect.bottom > -40) {
          el.classList.add("is-in");
        }
      }
    };
    revealIfVisible();

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting || entry.boundingClientRect.top < window.innerHeight) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -2% 0px", threshold: 0.01 },
    );
    els.forEach((el) => {
      if (!el.classList.contains("is-in")) io.observe(el);
    });
    return () => io.disconnect();
  }, [dep]);
}
