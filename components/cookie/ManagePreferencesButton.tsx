"use client";

import { showPreferences } from "vanilla-cookieconsent";

export default function ManagePreferencesButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button type="button" onClick={() => showPreferences()} className={className}>
      {children}
    </button>
  );
}
