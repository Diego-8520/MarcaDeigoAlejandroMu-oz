"use client";

import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PrintButton() {
  return (
    <Button size="sm" leftIcon={<Printer size={13} aria-hidden="true" />} onClick={() => window.print()}>
      imprimir / guardar pdf
    </Button>
  );
}
