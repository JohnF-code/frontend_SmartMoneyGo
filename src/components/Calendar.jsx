"use client";

import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "moment-timezone";

// Importa estilos CSS de React Big Calendar
import "react-big-calendar/lib/css/react-big-calendar.css";

// Establecer zona horaria Colombia => "America/Bogota"
moment.tz.setDefault("America/Bogota");

// Configurar localizador de moment
const localizer = momentLocalizer(moment);

export default function SMGCalendar({
  events = [],
  defaultView = "month", // "month", "week", "day", etc.
  onRangeChange, // callback si lo deseas
}) {
  // Ejemplo: handleSelectSlot, handleSelectEvent, etc.
  // Ajusta la altura, colores, etc. a tu gusto

  return (
    <div style={{ height: "600px", marginBottom: "1rem" }}>
      <Calendar
        localizer={localizer}
        events={events}
        defaultView={defaultView}
        startAccessor="start"
        endAccessor="end"
        style={{ height: "100%" }}
        onRangeChange={onRangeChange}
        // etc. más props
      />
    </div>
  );
}
