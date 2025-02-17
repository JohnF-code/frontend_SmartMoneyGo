"use client";

import React, { useState } from "react";
import dynamic from "next/dynamic";
import moment from "moment";
import "moment/locale/es";

const TuiCalendar = dynamic(() => import("@toast-ui/react-calendar"), {
  ssr: false,
});

export default function CalendarTUI({
  defaultDate,
  width = "650px",
  height = "400px",
  festivos = [],
  onPickDate,
}) {
  const [currentDate, setCurrentDate] = useState(() => {
    if (defaultDate) {
      if (typeof defaultDate === "string") return new Date(defaultDate);
      return defaultDate;
    }
    return new Date();
  });

  const handleBeforeCreateEvent = (res) => {
    if (onPickDate) {
      onPickDate(res.start.toISOString());
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate((prev) => moment(prev).subtract(1, "month").toDate());
  };
  const handleNextMonth = () => {
    setCurrentDate((prev) => moment(prev).add(1, "month").toDate());
  };

  return (
    <div
      style={{
        width,
        minHeight: height,
        border: "2px solid var(--color-primary)",
        borderRadius: "8px",
        margin: "0 auto",
        position: "relative",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "8px",
        }}
      >
        <button
          onClick={handlePrevMonth}
          style={{
            padding: "6px 12px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        >
          ←
        </button>
        <div style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
          {moment(currentDate).format("MMMM YYYY")}
        </div>
        <button
          onClick={handleNextMonth}
          style={{
            padding: "6px 12px",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        >
          →
        </button>
      </div>

      <TuiCalendar
        height={height}
        view="month"
        usageStatistics={false}
        isReadOnly={false}
        month={{
          startDayOfWeek: 1,
          visibleWeeksCount: 6,
        }}
        key={moment(currentDate).format("YYYY-MM")}
        defaultDate={currentDate}
        onBeforeCreateEvent={handleBeforeCreateEvent}
      />

      <style jsx global>{`
        @import url("@toast-ui/calendar/dist/toastui-calendar.min.css");

        .toastui-calendar-month-grid-line,
        .toastui-calendar-weekday-grid-line {
          display: none !important;
        }
        .toastui-calendar-day-name {
          color: var(--color-primary) !important;
          font-weight: bold !important;
        }
        .toastui-calendar-weekday-grid-date-name {
          text-align: center !important;
          display: block !important;
          margin: 0 auto !important;
        }
        .toastui-calendar-grid-cell:hover {
          background-color: var(--color-primary) !important;
          color: #fff !important;
        }
        .toastui-calendar-grid-cell:hover .toastui-calendar-weekday-grid-date-name {
          color: #fff !important;
          border-radius: 50% !important;
        }
        .toastui-calendar-weekday-grid-date--selected {
          background-color: var(--color-primary) !important;
          color: #fff !important;
          border-radius: 50% !important;
        }
        ${festivos
          .map(
            (f) => `
  .toastui-calendar-weekday-grid-date[data-date="${f}"] .toastui-calendar-weekday-grid-date-name {
    color: var(--color-danger) !important;
    font-weight: bold !important;
  }`
          )
          .join("\n")}
      `}</style>
    </div>
  );
}
