import { Suspense } from "react";
import Planner from "../planner/planner";
export default function Page(){return <Suspense fallback={<p>Finding journeys…</p>}><Planner/></Suspense>}
