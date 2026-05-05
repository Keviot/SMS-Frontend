import React, { type ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export default function Modal({ isOpen, onClose, title, children }: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Overlay - Centered on whole screen */}
      <div 
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      ></div>

      {/* Modal Container - Centered on whole screen */}
      <div className="bg-white w-full max-w-[550px] rounded-[32px] shadow-[0_25px_80px_-15px_rgba(0,0,0,0.2)] relative z-[10000] overflow-hidden transform transition-all animate-in fade-in zoom-in slide-in-from-bottom-8 duration-300">
        {/* Header */}
        <div className="px-8 pt-8 pb-4 flex items-center justify-between">
          <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
          >
            <X size={24} className="text-gray-400 group-hover:text-gray-600" />
          </button>
        </div>

        {/* Body */}
        <div className="px-8 pb-8">
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
