import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from "react";

import { clsx } from "clsx";

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "danger" | "warning" | "accent";
}) {
  return <span className={`badge badge-${tone}`}>{children}</span>;
}

export function Button({
  className,
  variant = "primary",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "secondary" | "ghost" }) {
  return <button className={clsx("button", `button-${variant}`, className)} {...props} />;
}

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <section className={clsx("card", className)} {...props} />;
}

export function Mono({ children }: { children: ReactNode }) {
  return <code className="mono">{children}</code>;
}
