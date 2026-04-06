import LoadingState from "@/app/(protected)/_components/LoadingState";
import React, { Suspense } from "react";
import Verification from "../../_components/Verification";

export default async function EmailVerification() {
  return (
    <Suspense fallback={<LoadingState />}>
      <Verification />
    </Suspense>
  );
}
