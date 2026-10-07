"use client";

import { ImageUp, LayoutTemplate, Moon, Palette, Percent, Printer, Rows3 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useState, type ChangeEvent } from "react";

import { useAsset } from "@/components/document/use-asset";
import { DocumentRenderer } from "@/components/preview/document-renderer";
import { TEMPLATES } from "@/components/templates/registry";
import { Button } from "@/components/ui/button";
import { LOGO_LIMITS } from "@/config/assets";
import { createSampleDocument } from "@/data/sample-document";
import { processLogo } from "@/lib/assets";
import { guestStorage } from "@/lib/guest";
import { cn } from "@/lib/utils";
import type { AssetRef } from "@/types/asset";
import type { TemplateId } from "@/types/template";

const TEMPLATE_IDS = Object.keys(TEMPLATES) as TemplateId[];

export function DocumentSandbox() {
  // ?long / ?inclusive / ?template=<id> / ?brand=none open those variants
  // directly (useful for headless print checks).
  const searchParams = useSearchParams();
  const [templateId, setTemplateId] = useState<TemplateId>(() => {
    const requested = searchParams.get("template");
    return TEMPLATE_IDS.find((id) => id === requested) ?? "minimal";
  });
  const [brandChosen, setBrandChosen] = useState(() => searchParams.get("brand") !== "none");
  const [long, setLong] = useState(() => searchParams.has("long"));
  const [inclusive, setInclusive] = useState(() => searchParams.has("inclusive"));
  const [dark, setDark] = useState(false);
  const [logo, setLogo] = useState<AssetRef | null>(null);
  const [logoStatus, setLogoStatus] = useState("");
  const asset = useAsset(logo, guestStorage.assets);

  const sample = createSampleDocument({
    repeat: long ? 12 : 1,
    taxMode: inclusive ? "inclusive" : "exclusive",
  });
  const document = {
    ...sample,
    branding: {
      ...sample.branding,
      templateId,
      brandColor: brandChosen ? sample.branding.brandColor : null,
      logo,
    },
  };

  async function handleLogo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const result = await processLogo(file);
    if (!result.ok) {
      setLogoStatus(`Rejected: ${result.error}`);
      return;
    }
    if (logo) await guestStorage.assets.delete(logo.assetId);
    const asset = await guestStorage.assets.put(result.asset);
    setLogo({ assetId: asset.id });
    setLogoStatus(
      `${Math.round(file.size / 1024)} KB ${file.type} → ${Math.round(asset.byteSize / 1024)} KB ${asset.mimeType}, ${asset.width}×${asset.height}`,
    );
  }

  return (
    <div className={cn("flex-1 bg-muted/50 print:bg-transparent", dark && "dark")}>
      <div className="flex min-h-full flex-col bg-background text-foreground print:bg-transparent">
        <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3 print:hidden">
          <span className="mr-auto text-sm text-muted-foreground">
            Document sandbox <span data-testid="logo-status">{logoStatus}</span>
          </span>
          <Button variant="outline" size="sm" asChild>
            <label>
              <ImageUp /> Logo
              <input
                type="file"
                accept={LOGO_LIMITS.acceptedTypes.join(",")}
                className="sr-only"
                onChange={handleLogo}
              />
            </label>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              setTemplateId(TEMPLATE_IDS[(TEMPLATE_IDS.indexOf(templateId) + 1) % TEMPLATE_IDS.length])
            }
          >
            <LayoutTemplate /> {TEMPLATES[templateId].name}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setBrandChosen(!brandChosen)}>
            <Palette /> {brandChosen ? "Brand colour" : "No brand colour"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setInclusive(!inclusive)}>
            <Percent /> {inclusive ? "Tax inclusive" : "Tax exclusive"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setLong(!long)}>
            <Rows3 /> {long ? "Short" : "Multi-page"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setDark(!dark)}>
            <Moon /> {dark ? "Light" : "Dark"} chrome
          </Button>
          <Button size="sm" onClick={() => window.print()}>
            <Printer /> Print / Save as PDF
          </Button>
        </div>
        <div className="overflow-x-auto p-8 print:overflow-visible print:p-0">
          <div className="mx-auto w-fit ring-1 ring-black/5 print:w-auto print:ring-0">
            <DocumentRenderer
              document={document}
              logo={asset && { src: asset.dataUrl, width: asset.width, height: asset.height }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
