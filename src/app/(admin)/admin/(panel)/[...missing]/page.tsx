import { notFound } from "next/navigation";

// An admin address with no page yet stays inside the panel (sidebar, session check) and shows
// the panel's own 404 rather than the user app's.
export default function MissingAdminPage() {
  notFound();
}
