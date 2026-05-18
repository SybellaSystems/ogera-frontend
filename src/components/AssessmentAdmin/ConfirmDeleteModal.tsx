import React from "react";
import { ExclamationTriangleIcon, TrashIcon } from "@heroicons/react/24/outline";

interface ConfirmDeleteModalProps {
  open: boolean;
  title: string;
  message: string;
  itemName?: string;
  confirmLabel?: string;
  isDeleting?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  open,
  title,
  message,
  itemName,
  confirmLabel = "Delete",
  isDeleting = false,
  onConfirm,
  onCancel,
}) => {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-delete-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shadow-2xl overflow-hidden">
        <div className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
            <ExclamationTriangleIcon className="h-8 w-8" />
          </div>
          <h3
            id="confirm-delete-title"
            className="text-xl font-bold text-gray-900 dark:text-white mb-2"
          >
            {title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-1">
            {message}
          </p>
          {itemName && (
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate px-2">
              &ldquo;{itemName}&rdquo;
            </p>
          )}
          <div className="flex gap-3 mt-8">
            <button
              type="button"
              onClick={onCancel}
              disabled={isDeleting}
              className="flex-1 rounded-xl bg-gray-100 dark:bg-gray-800 py-3 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 py-3 px-4 text-sm font-semibold text-white hover:bg-red-700 transition disabled:opacity-50"
            >
              <TrashIcon className="h-4 w-4" />
              {isDeleting ? "Deleting…" : confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;
