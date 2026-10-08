import { AppearanceSection } from "./appearance-section";
import { BusinessSection } from "./business-section";
import { ClientSection } from "./client-section";
import { DetailsSection } from "./details-section";
import { ItemsSection } from "./items-section";
import { NotesSection } from "./notes-section";
import { PaymentSection } from "./payment-section";

/**
 * The editor panel: every section reads and writes the shared document.
 * Content first, in the order an invoice is thought about; presentation
 * (Appearance) is optional and comes after the essentials.
 */
export function InvoiceEditor({ onChooseTemplate }: { onChooseTemplate: () => void }) {
  return (
    <div>
      <h1 className="sr-only">Create your invoice</h1>
      <BusinessSection />
      <ClientSection />
      <DetailsSection />
      <ItemsSection />
      <PaymentSection />
      <AppearanceSection onChooseTemplate={onChooseTemplate} />
      <NotesSection />
    </div>
  );
}
