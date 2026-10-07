import type { Metadata } from "next";

import { InvoiceBuilder } from "@/components/builder/invoice-builder";

export const metadata: Metadata = {
  title: "New invoice",
};

export default function CreatePage() {
  return <InvoiceBuilder />;
}
