import { createContext, useContext, useEffect, useState, type ReactNode, type MouseEvent } from "react";

export type RoutePath =
  | "/"
  | "/about"
  | "/projects"
  | "/journal"
  | "/resume"
  | "/lab"
  | "/404"
  | "/case/sentinel"
  | "/case/lokai"
  | "/case/feul";

interface RouterContextType {
  path: RoutePath;
  navigate: (to: string) => void;
  params: URLSearchParams;
}

const RouterContext = createContext<RouterContextType>({
  path: "/",
  navigate: () => {},
  params: new URLSearchParams(),
});

function parseLocation(): { path: RoutePath; params: URLSearchParams } {
  if (typeof window === "undefined") {
    return { path: "/", params: new URLSearchParams() };
  }

  // Check hash first (e.g. #/about, #about, #case/sentinel)
  let raw = window.location.hash.replace(/^#\/?/, "");
  // Fall back to pathname if hash is empty
  if (!raw) {
    raw = window.location.pathname.replace(/^\//, "");
  }

  const queryIdx = raw.indexOf("?");
  let queryStr = "";
  if (queryIdx >= 0) {
    queryStr = raw.slice(queryIdx);
    raw = raw.slice(0, queryIdx);
  } else {
    queryStr = window.location.search;
  }

  const params = new URLSearchParams(queryStr);
  const clean = ("/" + raw).replace(/\/+$/, "") || "/";

  // Support anchor hashes on the homepage (e.g. #work, #hero)
  const anchorAliases = ["/work", "/home", "/hero", "/contact"];
  if (anchorAliases.includes(clean)) {
    return { path: "/", params };
  }

  const validPaths: RoutePath[] = [
    "/",
    "/about",
    "/projects",
    "/journal",
    "/resume",
    "/lab",
    "/404",
    "/case/sentinel",
    "/case/lokai",
    "/case/feul",
  ];

  const matched = validPaths.find((p) => p === clean);
  if (matched) {
    return { path: matched, params };
  }

  // If unknown route, return 404
  if (clean !== "/") {
    return { path: "/404", params };
  }

  return { path: "/", params };
}

export function RouterProvider({ children }: { children: ReactNode }) {
  const [loc, setLoc] = useState<{ path: RoutePath; params: URLSearchParams }>(parseLocation);

  useEffect(() => {
    const handleUpdate = () => {
      setLoc(parseLocation());
    };

    window.addEventListener("hashchange", handleUpdate);
    window.addEventListener("popstate", handleUpdate);
    return () => {
      window.removeEventListener("hashchange", handleUpdate);
      window.removeEventListener("popstate", handleUpdate);
    };
  }, []);

  const navigate = (to: string) => {
    if (typeof window === "undefined") return;

    // Support anchor scrolling on homepage (e.g. #work)
    if (to.startsWith("#") && !to.startsWith("#/")) {
      const targetId = to.slice(1);
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: "smooth" });
        return;
      }
    }

    // Clean destination
    const normalized = to.startsWith("#") ? to.replace(/^#\/?/, "/") : to;
    const clean = normalized.startsWith("/") ? normalized : "/" + normalized;

    // Use hash navigation for rock-solid static hosting compatibility (e.g. GitHub Pages / preview)
    window.location.hash = clean;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <RouterContext.Provider value={{ path: loc.path, navigate, params: loc.params }}>
      {children}
    </RouterContext.Provider>
  );
}

export function useRoute() {
  return useContext(RouterContext);
}

export function Link({
  href,
  children,
  className,
  onClick,
  target,
  rel,
  title,
  ariaLabel,
}: {
  href: string;
  children: ReactNode;
  className?: string;
  onClick?: (e: MouseEvent) => void;
  target?: string;
  rel?: string;
  title?: string;
  ariaLabel?: string;
}) {
  const { navigate } = useRoute();

  const handleClick = (e: MouseEvent) => {
    if (onClick) onClick(e);
    if (target === "_blank" || href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")) {
      return;
    }
    e.preventDefault();
    navigate(href);
  };

  // Convert internal paths to hash for href preview
  const displayHref = href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("#")
    ? href
    : `#${href}`;

  return (
    <a
      href={displayHref}
      onClick={handleClick}
      className={className}
      target={target}
      rel={rel}
      title={title}
      aria-label={ariaLabel}
    >
      {children}
    </a>
  );
}
