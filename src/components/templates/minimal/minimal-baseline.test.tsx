import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { DocumentRenderer } from "@/components/preview/document-renderer";
import { renderFixtures } from "@/test/fixtures";

// Minimal is the approved baseline: its output must not change unless a
// change is deliberate and reviewed (then update the snapshot consciously).
describe("Minimal template baseline", () => {
  for (const fixture of renderFixtures()) {
    it(`renders unchanged: ${fixture.name}`, () => {
      const document = { ...fixture.document, branding: { ...fixture.document.branding, templateId: "minimal" as const } };
      const html = renderToStaticMarkup(
        <DocumentRenderer document={document} logo={fixture.logo} showPlaceholders={fixture.showPlaceholders} />,
      );
      expect(html).toMatchSnapshot();
    });
  }
});
