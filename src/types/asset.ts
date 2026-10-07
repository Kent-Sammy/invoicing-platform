/** A pointer from a document to a stored asset (e.g. a logo). */
export interface AssetRef {
  assetId: string;
}

/** A stored, already-processed asset. */
export interface Asset {
  id: string;
  mimeType: string;
  width: number;
  height: number;
  /** Size of the encoded image in bytes. */
  byteSize: number;
  /** The image as a data URL, ready for <img src>. */
  dataUrl: string;
  createdAt: string;
}
