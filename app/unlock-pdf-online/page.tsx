import { redirect } from "next/navigation";

/** Old Unlock PDF URL — tool is now Protect PDF. */
export default function Page() {
  redirect("/protect-pdf-online");
}
