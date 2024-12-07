self.onmessage = function (event) {
    const { type, data } = event.data;

    switch (type) {
        case 'calcularHoy':
            const pagosPendientesHoy = calcPagosPendientesHoy(data.pagosAgrupados);
            self.postMessage({ type: 'resultadoHoy', data: pagosPendientesHoy });
            break;

        case 'calcularManana':
            const pagosPendientesManana = calcPagosPendientesManana(data.pagosAgrupados);
            self.postMessage({ type: 'resultadoManana', data: pagosPendientesManana });
            break;

        default:
            console.error('Tipo de mensaje no soportado:', type);
    }
};

export function calcPagosPendientesHoy(pagosAgrupados) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Ajustar la hora para comparar solo la fecha

    let pagosPendientesHoy = [];

    pagosAgrupados.forEach(prestamo => {
        if (!prestamo.terminated) {
            // Ajustar las fechas del préstamo
            let fechaPagoEsperada = new Date(prestamo.date);
            fechaPagoEsperada.setHours(0, 0, 0, 0); // Ajustar hora
            let fechaFinal = new Date(prestamo.finishDate);
            fechaFinal.setHours(0, 0, 0, 0); // Ajustar hora
            fechaFinal.setDate(fechaFinal.getDate() + 1); // Agregar un día a la fecha final

            const montoCuota = (prestamo.loanAmount + (prestamo.loanAmount * (prestamo.interest / 100))) / prestamo.installments;

            // Crear un objeto para acumular pagos por fecha
            const pagosRealizadosPorFecha = {};
            prestamo.pagos.forEach(pago => {
                const fechaPago = new Date(pago.date);
                fechaPago.setHours(0, 0, 0, 0); // Ajustar hora
                const fechaClave = fechaPago.toDateString();
                pagosRealizadosPorFecha[fechaClave] = (pagosRealizadosPorFecha[fechaClave] || 0) + pago.amount;
            });

            // Verificar si el préstamo fue creado hoy, si es así, omitirlo
            const fechaCreacion = new Date(prestamo.date);
            fechaCreacion.setHours(0, 0, 0, 0); // Ajustar hora
            if (fechaCreacion.toDateString() === hoy.toDateString()) return;

            // Iterar solo por los días entre fechaPagoEsperada y fechaFinal
            let fecha = fechaPagoEsperada;
            while (fecha <= fechaFinal) {
                if (fecha.getDay() !== 0) { // Omitir los domingos
                    const fechaClave = fecha.toDateString();
                    const totalPagado = pagosRealizadosPorFecha[fechaClave] || 0;

                    // Si es hoy y el total pagado es menor que la cuota, agregarlo a los pagos pendientes
                    if (fecha.toDateString() === hoy.toDateString() && totalPagado < montoCuota) {
                        pagosPendientesHoy.push({
                            cliente: prestamo.clientId,
                            montoPendiente: montoCuota - totalPagado,
                            fechaEsperada: new Date(fecha) // Clonar la fecha
                        });
                    }
                }
                fecha.setDate(fecha.getDate() + 1);
            }
        }
    });

    return pagosPendientesHoy;
}


export function calcPagosPendientesManana(pagosAgrupados) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Ajustar la hora para comparar solo la fecha

    const manana = new Date(hoy);
    manana.setDate(hoy.getDate() + 1); // Avanzar un día para calcular mañana

    let pagosPendientesManana = [];

    pagosAgrupados.forEach(prestamo => {
        if (!prestamo.terminated) {
            // Ajustar las fechas de pago y final
            let fechaPagoEsperada = new Date(prestamo.date);
            fechaPagoEsperada.setHours(0, 0, 0, 0); // Ajustar la hora
            let fechaFinal = new Date(prestamo.finishDate);
            fechaFinal.setHours(0, 0, 0, 0); // Ajustar la hora
            fechaFinal.setDate(fechaFinal.getDate() + 1); // Agregar un día a la fecha final

            const montoCuota = (prestamo.loanAmount + (prestamo.loanAmount * (prestamo.interest / 100))) / prestamo.installments;

            // Crear un mapa de pagos por fecha
            const pagosRealizadosPorFecha = {};
            prestamo.pagos.forEach(pago => {
                const fechaPago = new Date(pago.date);
                fechaPago.setHours(0, 0, 0, 0); // Ajustar la hora
                const key = fechaPago.toDateString();
                pagosRealizadosPorFecha[key] = (pagosRealizadosPorFecha[key] || 0) + pago.amount;
            });

            // Verificar los pagos para los días entre fechaPagoEsperada y fechaFinal
            let fecha = fechaPagoEsperada;
            while (fecha <= fechaFinal) {
                if (fecha.getDay() !== 0) { // Omitir los domingos
                    const fechaClave = fecha.toDateString();
                    const totalPagado = pagosRealizadosPorFecha[fechaClave] || 0;

                    // Verificar si es mañana y hay un pago pendiente
                    if (fecha.toDateString() === manana.toDateString() && totalPagado < montoCuota) {
                        pagosPendientesManana.push({
                            cliente: prestamo.clientId,
                            montoPendiente: montoCuota - totalPagado,
                            fechaEsperada: new Date(fecha) // Clonar la fecha
                        });
                    }
                }
                fecha.setDate(fecha.getDate() + 1); // Avanzar un día
            }
        }
    });

    return pagosPendientesManana;
}

