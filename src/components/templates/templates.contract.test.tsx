import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { DocumentRenderer } from "@/components/preview/document-renderer";
import { createDocumentView, withPlaceholders } from "@/lib/documents";
import { renderFixtures } from "@/test/fixtures";
import type { TemplateId } from "@/types/template";

import { TEMPLATES } from "./registry";

// The contract from TEMPLATE_ARCHITECTURE.md §3.2: every template must render
// every value the view provides. Templates may arrange and style content
// freely, but may never drop or alter it.

function textOf(html: string): string {
  return html
    .replace(/<style>.*?<\/style>/gs, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/\s+/g, " ");
}

const normalise = (value: string) => value.replace(/\s+/g, " ").trim();

describe.each(Object.keys(TEMPLATES) as TemplateId[])("template contract: %s", (templateId) => {
  for (const fixture of renderFixtures()) {
    it(`renders every required value: ${fixture.name}`, () => {
      const document = { ...fixture.document, branding: { ...fixture.document.branding, templateId } };
      const html = renderToStaticMarkup(
        <DocumentRenderer document={document} logo={fixture.logo} showPlaceholders={fixture.showPlaceholders} />,
      );
      const text = textOf(html);
      const view = createDocumentView(
        fixture.showPlaceholders ? withPlaceholders(document).document : document,
      );
      const expectText = (value: string) => {
        if (value.trim()) expect(text, value).toContain(normalise(value));
      };

      [view.title, view.number, view.issueDate, view.dueDate].forEach(expectText);
      for (const party of [view.business, view.client]) {
        [party.name, party.email, party.phone, party.address, party.taxId].forEach(expectText);
      }
      for (const item of view.items) {
        [item.description, item.quantity, item.unitPrice, item.amount].forEach(expectText);
      }
      for (const row of view.summary) [row.label, row.amount].forEach(expectText);
      [view.total.label, view.total.amount].forEach(expectText);
      if (view.taxBreakdown) {
        expectText(view.taxBreakdown.note);
        view.taxBreakdown.lines.forEach((row) => [row.label, row.amount].forEach(expectText));
      }

      const payment = view.payment;
      if (payment?.bankTransfer) {
        payment.bankTransfer.fields.forEach((field) => [field.label, field.value].forEach(expectText));
        expectText(payment.bankTransfer.instructions);
      }
      if (payment?.link) {
        expectText(payment.link.label);
        // Safe, real link to the validated URL.
        expect(html).toContain(`href="${payment.link.url}" target="_blank" rel="noopener noreferrer"`);
      }
      if (payment?.qr) {
        expectText(payment.qr.caption);
        expect(html).toContain(`aria-label="${payment.qr.caption}: ${payment.qr.display}"`);
        expect(html).toContain('fill="#000000"');
      }
      [view.notes, view.terms].forEach(expectText);
    });
  }

  it("marks sample content so it never prints", () => {
    const fixture = renderFixtures().find((f) => f.showPlaceholders)!;
    const document = { ...fixture.document, branding: { ...fixture.document.branding, templateId } };
    const html = renderToStaticMarkup(<DocumentRenderer document={document} showPlaceholders />);
    for (const sample of ["Your Business", "Client Name", "Brand identity design"]) {
      const at = html.indexOf(sample);
      expect(at, sample).toBeGreaterThan(-1);
      // The sample text sits inside an element marked data-placeholder.
      const before = html.slice(0, at);
      const openMarked = before.lastIndexOf("data-placeholder");
      expect(openMarked, `${sample} is marked`).toBeGreaterThan(-1);
    }
  });
});
