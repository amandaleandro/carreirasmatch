"use client";

import type { ReactNode } from "react";
import { track, ANALYTICS_EVENTS } from "@/lib/analytics";

type ApplicationAction = (formData: FormData) => void | Promise<void>;

export function TrackedApplicationForm({
  action,
  children,
  className,
}: {
  action: ApplicationAction;
  children: ReactNode;
  className?: string;
}) {
  return (
    <form
      action={action}
      className={className}
      onSubmit={() => {
        track(ANALYTICS_EVENTS.APPLICATION_FORM_SUBMITTED, { source: "manual" });
      }}
    >
      {children}
    </form>
  );
}
