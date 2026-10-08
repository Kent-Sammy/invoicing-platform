import { getBrowserStorage } from "@/lib/storage";
import type { Asset } from "@/types/asset";

import type { AssetStore } from "./asset-store";

export const GUEST_ASSET_PREFIX = "invoice-platform:asset:";

function isAsset(value: unknown): value is Asset {
  return (
    typeof value === "object" &&
    value !== null &&
    "id" in value &&
    typeof value.id === "string" &&
    "dataUrl" in value &&
    typeof value.dataUrl === "string"
  );
}

/**
 * Guest asset storage: one localStorage entry per asset, separate from the
 * draft. Writes reject if the browser's storage quota is exceeded.
 */
export function createLocalStorageAssetStore(
  prefix: string = GUEST_ASSET_PREFIX,
  getStorage: () => Storage = getBrowserStorage,
  createId: () => string = () => crypto.randomUUID(),
): AssetStore {
  return {
    async put(newAsset) {
      const asset: Asset = { ...newAsset, id: createId(), createdAt: new Date().toISOString() };
      getStorage().setItem(prefix + asset.id, JSON.stringify(asset));
      return asset;
    },

    async get(id) {
      const raw = getStorage().getItem(prefix + id);
      if (raw === null) return null;
      try {
        const parsed: unknown = JSON.parse(raw);
        return isAsset(parsed) ? parsed : null;
      } catch {
        return null;
      }
    },

    async delete(id) {
      getStorage().removeItem(prefix + id);
    },
  };
}
