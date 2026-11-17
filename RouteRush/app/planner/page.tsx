import { Suspense } from "react";
import Planner from "./planner";
export default function Page() {
  return (
    <Suspense fallback={<p>Loading journey planner…</p>}>
      <Planner />
    </Suspense>
  );
}
