import type { Asset } from "@/types/asset";

export type NewAsset = Omit<Asset, "id" | "createdAt">;

/**
 * Where processed assets (logos) are kept. Documents hold only an AssetRef.
 * Guests store assets in the browser; accounts will later use cloud storage.
 */
export interface AssetStore {
  put(asset: NewAsset): Promise<Asset>;
  get(id: string): Promise<Asset | null>;
  delete(id: string): Promise<void>;
}
