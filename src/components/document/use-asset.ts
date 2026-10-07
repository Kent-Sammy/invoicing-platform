"use client";

import { useEffect, useState } from "react";

import type { AssetStore } from "@/lib/assets";
import type { Asset, AssetRef } from "@/types/asset";

/** Resolves an asset reference (e.g. the document's logo) to the stored asset. */
export function useAsset(ref: AssetRef | null, store: AssetStore): Asset | null {
  const assetId = ref?.assetId ?? null;
  const [loaded, setLoaded] = useState<{ id: string; asset: Asset | null } | null>(null);

  useEffect(() => {
    if (!assetId) return;
    let cancelled = false;
    store
      .get(assetId)
      .catch(() => null)
      .then((asset) => {
        if (!cancelled) setLoaded({ id: assetId, asset });
      });
    return () => {
      cancelled = true;
    };
  }, [assetId, store]);

  return loaded && loaded.id === assetId ? loaded.asset : null;
}

/** Resolves an asset reference to an image src. */
export function useAssetSrc(ref: AssetRef | null, store: AssetStore): string | null {
  return useAsset(ref, store)?.dataUrl ?? null;
}
