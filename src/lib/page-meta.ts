import { useEffect } from "react";

/**
 * Replacement for TanStack Router's route-level `head: () => ({ meta: [...] })`.
 *
 * TerraZone is a client-only SPA, so there is no SSR head management. This
 * sets document.title / <meta name="description"> on mount and restores the
 * previous values on unmount, so navigating from a public marketing page back
 * into the product does not leave a stale title behind.
 */
/**
 * The public marketing pages are long-scrolling. Without this, navigating
 * (say) from the bottom of /pilot to /book lands you mid-page, because the
 * SPA keeps the previous scroll offset.
 */
export function useScrollToTop() {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0 });
  }, []);
}

export function usePageMeta(title: string, description?: string) {
  useEffect(() => {
    const previousTitle = document.title;
    document.title = title;

    let meta: HTMLMetaElement | null = null;
    let previousDescription: string | null = null;
    let createdMeta = false;

    if (description) {
      meta = document.querySelector<HTMLMetaElement>('meta[name="description"]');

      if (meta) {
        previousDescription = meta.content;
      } else {
        meta = document.createElement("meta");
        meta.name = "description";
        document.head.appendChild(meta);
        createdMeta = true;
      }

      meta.content = description;
    }

    return () => {
      document.title = previousTitle;

      if (!meta) return;

      if (createdMeta) {
        meta.remove();
      } else if (previousDescription !== null) {
        meta.content = previousDescription;
      }
    };
  }, [title, description]);
}
