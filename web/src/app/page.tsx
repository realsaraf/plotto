// Root page — middleware handles redirect to /login or /timeline.
// This renders only if middleware is bypassed (shouldn't happen in prod).
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/timeline");
}