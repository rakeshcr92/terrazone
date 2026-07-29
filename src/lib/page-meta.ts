import { useEffect } from "react";

/**
 * Replacement for TanStack Router's route-level `head: () => ({ meta: [...] })`.
 *
 * TerraZone is a client-only SPA, so there is no SSR head management. This
 * sets document.title / <meta name="description"> on mount and restores the
 * previous values on unmount, so navigating from a public marketing page back
 * into the product does not leave a stale title behind.
 */
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
