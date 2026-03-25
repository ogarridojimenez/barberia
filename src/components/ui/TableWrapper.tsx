"use client";

import { ReactNode } from "react";

interface TableWrapperProps {
  children: ReactNode;
  minWidth?: number;
}

export function TableWrapper({ children, minWidth = 600 }: TableWrapperProps) {
  return (
    <div
      style={{
        overflowX: "auto",
        WebkitOverflowScrolling: "touch",
      }}
    >
      <div style={{ minWidth }}>{children}</div>
    </div>
  );
}
