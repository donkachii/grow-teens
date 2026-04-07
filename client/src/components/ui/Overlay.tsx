"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

interface BaseOverlayProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}

interface ModalProps extends BaseOverlayProps {
  title?: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  closeLabel?: string;
}

const modalWidths = {
  sm: "max-w-md",
  md: "max-w-lg",
  lg: "max-w-2xl",
  xl: "max-w-4xl",
};

export function Modal({
  isOpen,
  onClose,
  children,
  title,
  footer,
  size = "md",
  closeLabel = "Close modal",
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
      <button
        type="button"
        aria-label="Close modal overlay"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/50"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-10 flex max-h-[90vh] w-full flex-col overflow-hidden rounded-3xl bg-white shadow-2xl",
          modalWidths[size]
        )}
      >
        {(title || closeLabel) && (
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
            <div className="text-lg font-semibold text-slate-900">{title}</div>
            <button
              type="button"
              onClick={onClose}
              aria-label={closeLabel}
              className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        <div className="overflow-y-auto px-6 py-5">{children}</div>
        {footer ? (
          <div className="border-t border-slate-200 px-6 py-4">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}

interface DrawerProps extends BaseOverlayProps {
  title?: ReactNode;
  side?: "left" | "right";
  widthClassName?: string;
  footer?: ReactNode;
}

export function Drawer({
  isOpen,
  onClose,
  children,
  title,
  side = "right",
  widthClassName = "w-full max-w-2xl",
  footer,
}: DrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[90]">
      <button
        type="button"
        aria-label="Close drawer overlay"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "absolute inset-y-0 flex flex-col bg-white shadow-2xl",
          widthClassName,
          side === "right" ? "right-0" : "left-0"
        )}
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div className="text-lg font-semibold text-slate-900">{title}</div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="rounded-full p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
        {footer ? (
          <div className="border-t border-slate-200 px-6 py-4">{footer}</div>
        ) : null}
      </div>
    </div>
  );
}
