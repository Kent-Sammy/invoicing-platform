import { AdjustmentsSection } from "./adjustments-section";
import { BusinessSection } from "./business-section";
import { ClientSection } from "./client-section";
import { DetailsSection } from "./details-section";
import { ItemsSection } from "./items-section";
import { NotesSection } from "./notes-section";
import { PaymentSection } from "./payment-section";
import { TemplateSection } from "./template-section";

/** The editor panel: every section reads and writes the shared document. */
export function InvoiceEditor({ onChooseTemplate }: { onChooseTemplate: () => void }) {
  return (
    <div>
      <TemplateSection onChoose={onChooseTemplate} />
      <BusinessSection />
      <ClientSection />
      <DetailsSection />
      <ItemsSection />
      <AdjustmentsSection />
      <PaymentSection />
      <NotesSection />
    </div>
  );
}
