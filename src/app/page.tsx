import { redirect } from "next/navigation";

// No landing page yet: the product starts at the builder.
export default function Home() {
  redirect("/create");
}
