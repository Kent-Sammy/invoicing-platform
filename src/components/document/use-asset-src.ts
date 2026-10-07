"use client";

import { useEffect, useState } from "react";

import type { AssetStore } from "@/lib/assets";
import type { AssetRef } from "@/types/asset";

/** Resolves an asset reference (e.g. the document's logo) to an image src. */
export function useAssetSrc(ref: AssetRef | null, store: AssetStore): string | null {
  const assetId = ref?.assetId ?? null;
  const [loaded, setLoaded] = useState<{ id: string; src: string | null } | null>(null);

  useEffect(() => {
    if (!assetId) return;
    let cancelled = false;
    store
      .get(assetId)
      .catch(() => null)
      .then((asset) => {
        if (!cancelled) setLoaded({ id: assetId, src: asset?.dataUrl ?? null });
      });
    return () => {
      cancelled = true;
    };
  }, [assetId, store]);

  return loaded && loaded.id === assetId ? loaded.src : null;
}
