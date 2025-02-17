"use client";

import React from "react";
import { createPortal } from "react-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

import CalendarTUI from "./CalendarTUI";

export default function CalendarModal({
  onClose,
  onDatePick,
  defaultDate,
  festivos = [],
}) {
  const handlePick = (fechaISO) => {
    if (onDatePick) {
      onDatePick(fechaISO);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-60"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-700 p-4 relative rounded"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-2 right-2 text-primary hover:text-red-500"
          onClick={onClose}
        >
          <FontAwesomeIcon icon={faTimes} />
        </button>

        <CalendarTUI
          defaultDate={defaultDate}
          width="650px"
          height="400px"
          festivos={festivos}
          onPickDate={handlePick}
        />
      </div>
    </div>,
    document.body
  );
}
