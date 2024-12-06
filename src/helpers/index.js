export function calculateEndDate(fechaInicio, numeroCuotas) {
    // Convertir la fecha de inicio en un objeto Date
    let fecha = new Date(fechaInicio);
    let cuotasRestantes = numeroCuotas;

    // Avanzar día por día, excluyendo los domingos
    while (cuotasRestantes > 0) {
        fecha.setDate(fecha.getDate() + 1);
        
        // Si no es domingo, reducir el número de cuotas restantes
        if (fecha.getDay() !== 0) {
            cuotasRestantes--;
        }
    }

    // Devolver la fecha de finalización en formato ISO (YYYY-MM-DD)
    return fecha.toISOString().split('T')[0];
}

export function calcularDiasAtraso(fechaFinalizacion, fechaPago) {
    // Convertir ambas fechas en objetos Date
    let fechaFin = new Date(fechaFinalizacion);
    let fechaPag = new Date(fechaPago);

    // Calcular la diferencia en milisegundos
    let diferenciaMs = fechaPag - fechaFin;

    // Convertir la diferencia de milisegundos a días
    let diferenciaDias = diferenciaMs / (1000 * 60 * 60 * 24);

    // Si la diferencia es negativa, no hay atraso
    if (diferenciaDias < 0) {
        return 0;
    }

    return Math.ceil(diferenciaDias);
}

export function agruparPagosPorCliente(pagos, prestamos) {
    return new Promise((resolve) => {
        const loans = [];
        try {
            // Filtrar solo los pagos que tienen un loanId y un _id válidos
            const pagosValidos = pagos.filter(pago => pago?.loanId?._id);

            prestamos.forEach(prestamo => {
                const currentPayments = pagosValidos.filter(pago => pago.loanId._id === prestamo._id);

                loans.push({
                    ...prestamo,
                    pagos: currentPayments
                });
            });

            resolve(loans);
        } catch (error) {
            console.error('Error en agruparPagosPorCliente:', error);
            resolve([]); // Continuar la ejecución con un array vacío
        }
    });
}


export function formatearFecha(fecha) {
    const opciones = {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      timeZone: 'America/Bogota' // Zona horaria de Colombia
    };
    const date = new Date(fecha);
    return new Intl.DateTimeFormat('es-CO', opciones).format(date);
  }

export function calcularMontoNoRecaudado(prestamos) {
    
    let montoNoRecaudadoTotal = 0;

    prestamos.forEach(prestamo => {
        // Si el prestamo ya ha sido terminado, es porque se pago completo y no se debe dinero
        if (!prestamo.terminated) {
            const fechaInicio = new Date(prestamo.date);
            const fechaActual = new Date();

            // Los días transcurridos son los días que han pasado desde que inicio el prestamo hasta ahora
            const diasTranscurridos = (fechaActual - fechaInicio) / 1000 / 60 / 60 / 24;
        
            let i = 0;
            let money = (prestamo.loanAmount * (prestamo.interest / 100) + prestamo.loanAmount);
            let cuota = prestamo.installmentValue;

            // console.log(diasTranscurridos)

            // Iterar por cada día dentro del rango del préstamo
            while (i < diasTranscurridos) {
                // Se calcula el dinero que debería deber el cliente en los días que han transcurrido
                // console.log('cuota', cuota)
                money -= cuota;
                i++
            }
            // console.log(money);
            // Si el cliente debe más dinero que el que debería
            if (prestamo.balance > money) {
                // Sumar impago
                montoNoRecaudadoTotal += prestamo.balance - money;
            }
        }
    });

    return montoNoRecaudadoTotal;
}

export function calcPagosPendientesHoy(pagosAgrupados) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Ajustar la hora para comparar solo la fecha

    let pagosPendientesHoy = [];

    pagosAgrupados.forEach(prestamo => {
        if (!prestamo.terminated) {
            let fechaPagoEsperada = new Date(prestamo.date);
            fechaPagoEsperada.setHours(0, 0, 0, 0); // Ajustar la hora para comparar solo la fecha
            let fechaFinal = new Date(prestamo.finishDate);
            fechaFinal.setHours(0, 0, 0, 0); // Ajustar la hora para comparar solo la fecha

                        // Agregar un día a la fecha final
                        fechaFinal.setDate(fechaFinal.getDate() + 1); // Esto hace que el rango termine un día después

            const montoCuota = (prestamo.loanAmount + (prestamo.loanAmount * (prestamo.interest / 100))) / prestamo.installments;

            // Acumular pagos realizados por fecha
            const pagosRealizadosPorFecha = prestamo.pagos.reduce((mapa, pago) => {
                const fechaPago = new Date(pago.date);
                fechaPago.setHours(0, 0, 0, 0); // Ajustar la hora para comparar solo la fecha
                const key = fechaPago.toDateString();
                mapa[key] = (mapa[key] || 0) + pago.amount;
                return mapa;
            }, {});

            const fechaCreacion = new Date(prestamo.date);
            fechaCreacion.setHours(0, 0, 0, 0); // Ajustar la hora para comparar solo la fecha

            // Verificar si el préstamo fue creado hoy
            if (fechaCreacion.toDateString() === hoy.toDateString()) {
                return; // Salir y omitir este préstamo
            }

            // Iterar por cada día dentro del rango del préstamo
            while (fechaPagoEsperada <= fechaFinal) {
                if (fechaPagoEsperada.getDay() !== 0) { // Omitir los domingos
                    const fechaClave = fechaPagoEsperada.toDateString();
                    const totalPagado = pagosRealizadosPorFecha[fechaClave] || 0;

                    // Solo agregar pagos pendientes para hoy
                    if (fechaPagoEsperada.toDateString() === hoy.toDateString() && totalPagado < montoCuota) {
                        pagosPendientesHoy.push({
                            cliente: prestamo.clientId,
                            montoPendiente: montoCuota - totalPagado,
                            fechaEsperada: new Date(fechaPagoEsperada) // Clonar fecha
                        });
                    }
                }
                fechaPagoEsperada.setDate(fechaPagoEsperada.getDate() + 1);
            }
        }
    });

    return pagosPendientesHoy;
}

export function monthCreatedLoans(loans) {
    // console.log('loans', loans);
    const hoy = new Date();
    const mesActual = hoy.getMonth();
    const añoActual = hoy.getFullYear();

    let createdLoans = 0;

    loans.forEach(loan => {
        const fechaCreacion = new Date(loan.date);
        const mesCreacion = fechaCreacion.getMonth();
        const añoCreacion = fechaCreacion.getFullYear();

        if (mesCreacion === mesActual && añoCreacion === añoActual) {
            createdLoans += 1;
        }
    });

    return createdLoans;
}


export function calclMonthPayments(pagos) {
    const hoy = new Date();
    const mesActual = hoy.getMonth();
    const añoActual = hoy.getFullYear();

    let totalDineroRecaudado = 0;

    pagos.forEach(pago => {
        const fechaPago = new Date(pago.date);
        const mesPago = fechaPago.getMonth();
        const añoPago = fechaPago.getFullYear();

        if (mesPago === mesActual && añoPago === añoActual) {
            totalDineroRecaudado += pago.amount;
        }
    });

    return totalDineroRecaudado;
}

export function calcPostPayments(pagos) {
    const hoy = new Date();
    const mesActual = hoy.getMonth();
    const añoActual = hoy.getFullYear();

    let cantidadPagosRegistrados = 0;

    pagos.forEach(pago => {
        const fechaPago = new Date(pago.date);
        const mesPago = fechaPago.getMonth();
        const añoPago = fechaPago.getFullYear();

        if (mesPago === mesActual && añoPago === añoActual) {
            cantidadPagosRegistrados += 1;
        }
    });

    return cantidadPagosRegistrados;
}

export function agruparPagosPorMes(pagos) {
    const pagosPorMes = {};

    pagos.forEach(pago => {
        const fechaPago = new Date(pago.date);
        const mes = fechaPago.getMonth();
        const año = fechaPago.getFullYear();
        const key = `${año}-${mes + 1}`; // Crear una clave única para cada mes y año (mes + 1 porque getMonth() es 0-indexado)

        if (!pagosPorMes[key]) {
            pagosPorMes[key] = {
                year: año,
                month: mes + 1, // Ajustar para que sea 1-indexado
                total: 0
            };
        }

        pagosPorMes[key].total += pago.amount;
    });

    return Object.values(pagosPorMes);
}

function obtenerFechasDePago(prestamo) {
    const fechas = [];
    let fechaActual = new Date(prestamo.date);
    const cuotaDiaria = prestamo.installmentValue;

    for (let i = 0; i < prestamo.installments; i++) {
        if (fechaActual.getDay() !== 0) { // Si no es domingo
            fechas.push({ date: new Date(fechaActual), amount: cuotaDiaria });
        } else {
            i--; // No contar este día como una cuota
        }
        fechaActual.setDate(fechaActual.getDate() + 1);
    }

    return fechas;
}

// Función para contar los impagos por mes
export function contarImpagosPorMes(pagosAgrupados) {
    const impagosPorMes = {};

 
    pagosAgrupados.forEach(prestamo => {
        const fechasDePago = obtenerFechasDePago(prestamo);
      
        const pagosRegistrados = prestamo.pagos.map(pago => new Date(pago.date));

        fechasDePago.forEach(fechaEsperada => {
            const mes = fechaEsperada.date.getMonth();
            const año = fechaEsperada.date.getFullYear();
            const key = `${año}-${mes + 1}`;

            const pagoEncontrado = pagosRegistrados.some(fechaPago => 
                fechaPago.getFullYear() === fechaEsperada.date.getFullYear() &&
                fechaPago.getMonth() === fechaEsperada.date.getMonth() &&
                fechaPago.getDate() === fechaEsperada.date.getDate()
            );

            if (!pagoEncontrado) {
                if (!impagosPorMes[key]) {
                    impagosPorMes[key] = {
                        year: año,
                        month: mes + 1, // Ajustar para que sea 1-indexado
                        total: 0
                    };
                }
                impagosPorMes[key].total += fechaEsperada.amount;
            }
        });
    });


    return Object.values(impagosPorMes);
}

export const calculateNetMonthlyEarnings = (payments, capitals) => {
    const earningsByMonth = {};

    // Sumar los pagos por mes
    payments.forEach(payment => {
        const paymentDate = new Date(payment.date);
        const month = paymentDate.getMonth(); // 0 = January, 11 = December
        const year = paymentDate.getFullYear();
        const monthKey = `${year}-${month + 1}`; // e.g., "2024-7" for July 2024

        if (!earningsByMonth[monthKey]) {
            earningsByMonth[monthKey] = { earnings: 0, capital: 0 };
        }

        earningsByMonth[monthKey].earnings += payment.amount;
    });

    // Restar el capital invertido por mes
    capitals.forEach(capital => {
        const capitalDate = new Date(capital.date);
        const month = capitalDate.getMonth(); // 0 = January, 11 = December
        const year = capitalDate.getFullYear();
        const monthKey = `${year}-${month + 1}`; // e.g., "2024-7" for July 2024

        if (!earningsByMonth[monthKey]) {
            earningsByMonth[monthKey] = { earnings: 0, capital: 0 };
        }

        earningsByMonth[monthKey].capital += capital.capital;
    });

    // Calcular las ganancias netas por mes
    const netEarningsArray = Object.keys(earningsByMonth).map(monthKey => {
        const { earnings, capital } = earningsByMonth[monthKey];
        const netEarnings = earnings - capital;
        return {
            month: monthKey,
            netEarnings: netEarnings
        };
    });

    // console.log(netEarningsArray)
    return netEarningsArray;
};

export const calculateMonthlyEarnings = (payments) => {
    const earningsByMonth = {};

    payments.forEach(payment => {
        const paymentDate = new Date(payment.date);
        const month = paymentDate.getMonth(); // 0 = January, 11 = December
        const year = paymentDate.getFullYear();
        const monthKey = `${year}-${month + 1}`; // e.g., "2024-7" for July 2024

        if (!earningsByMonth[monthKey]) {
            earningsByMonth[monthKey] = 0;
        }

        earningsByMonth[monthKey] += payment.amount;
    });

    // Convert the object to an array of { month, earnings } objects
    const earningsArray = Object.keys(earningsByMonth).map(monthKey => {
        return {
            month: monthKey,
            grossEarnings: earningsByMonth[monthKey]
        };
    });

    return earningsArray;
};

export const calculateDailyGrossEarningsLast7Days = (payments) => {
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 7); // 7 días atrás

    const earningsByDay = {};

    // Filtrar y sumar los pagos de los últimos 7 días
    payments.forEach(payment => {
        const paymentDate = new Date(payment.date);

        if (paymentDate >= startDate && paymentDate <= today) {
            const dayKey = paymentDate.toISOString().split('T')[0]; // "YYYY-MM-DD"

            if (!earningsByDay[dayKey]) {
                earningsByDay[dayKey] = 0;
            }

            earningsByDay[dayKey] += payment.amount;
        }
    });

    // Convertir el objeto earningsByDay en un arreglo de resultados
    const dailyGrossEarningsArray = Object.keys(earningsByDay).map(dayKey => {
        const date = new Date(dayKey);
        const dayOfWeek = getDayOfWeek(date); // Obtener el día de la semana

        return {
            date: dayKey,
            dayOfWeek: dayOfWeek,
            grossEarnings: earningsByDay[dayKey]
        };
    });

    // Ordenar el arreglo por fecha
    dailyGrossEarningsArray.sort((a, b) => new Date(a.date) - new Date(b.date));

    return dailyGrossEarningsArray;
};

// Función auxiliar para obtener el nombre del día de la semana
const getDayOfWeek = (date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[date.getDay()];
};

export const calculateDailyNetEarningsLast7Days = (payments, capitals) => {
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - 7); // 7 días atrás

    const earningsByDay = {};
    const capitalByDate = {};

    // Filtrar y sumar los pagos de los últimos 7 días
    payments.forEach(payment => {
        const paymentDate = new Date(payment.date);

        if (paymentDate >= startDate && paymentDate <= today) {
            const dayKey = paymentDate.toISOString().split('T')[0]; // "YYYY-MM-DD"

            if (!earningsByDay[dayKey]) {
                earningsByDay[dayKey] = 0;
            }

            earningsByDay[dayKey] += payment.amount;
        }
    });

    // Agrupar el capital invertido por fecha
    capitals.forEach(capital => {
        const capitalDate = new Date(capital.date);
        const dayKey = capitalDate.toISOString().split('T')[0]; // "YYYY-MM-DD"

        if (!capitalByDate[dayKey]) {
            capitalByDate[dayKey] = 0;
        }

        capitalByDate[dayKey] += capital.capital;
    });

    // Convertir el objeto earningsByDay en un arreglo de resultados
    const dailyNetEarningsArray = Object.keys(earningsByDay).map(dayKey => {
        const date = new Date(dayKey);
        const dayOfWeek = getDayOfWeek(date); // Obtener el día de la semana

        const grossEarnings = earningsByDay[dayKey];
        const capital = capitalByDate[dayKey] || 0;
        const netEarnings = grossEarnings - capital;

        return {
            date: dayKey,
            dayOfWeek: dayOfWeek,
            netEarnings: netEarnings
        };
    });

    // Ordenar el arreglo por fecha
    dailyNetEarningsArray.sort((a, b) => new Date(a.date) - new Date(b.date));

    return dailyNetEarningsArray;
};

export const calculateLoansPerMonth = (clients) => {
    return clients.reduce((acc, client) => {
        // Verificar si el cliente tiene una fecha de préstamo
        if (client.date) {
            // Obtener el año y el mes del campo 'date' del cliente
            const date = new Date(client.date);
            const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`; // "YYYY-MM"

            // Si el año-mes ya está en el acumulador, suma 1 al conteo de préstamos
            if (acc[yearMonth]) {
                acc[yearMonth] += 1;
            } else {
                // Si el año-mes no está en el acumulador, inicializa el conteo con 1
                acc[yearMonth] = 1;
            }
        }
        return acc;
    }, {}); // El objeto vacío es el valor inicial del acumulador
};

export function formatearNumero(numero) {
    const numeroFormateado = new Intl.NumberFormat('es-CO').format(numero);
    return numeroFormateado;
  }

  export function calcPagosPendientesManana(pagosAgrupados) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0); // Ajustar la hora para comparar solo la fecha

    const manana = new Date(hoy);
    manana.setDate(hoy.getDate() + 1); // Avanzar un día para calcular mañana

    let pagosPendientesManana = [];

    pagosAgrupados.forEach(prestamo => {
        if (!prestamo.terminated) {
            let fechaPagoEsperada = new Date(prestamo.date);
            fechaPagoEsperada.setHours(0, 0, 0, 0); // Ajustar la hora para comparar solo la fecha
            let fechaFinal = new Date(prestamo.finishDate);
            fechaFinal.setHours(0, 0, 0, 0); // Ajustar la hora para comparar solo la fecha

                        // Agregar un día a la fecha final
                        fechaFinal.setDate(fechaFinal.getDate() + 1); // Esto hace que el rango termine un día después

            const montoCuota = (prestamo.loanAmount + (prestamo.loanAmount * (prestamo.interest / 100))) / prestamo.installments;

            // Acumular pagos realizados por fecha
            const pagosRealizadosPorFecha = prestamo.pagos.reduce((mapa, pago) => {
                const fechaPago = new Date(pago.date);
                fechaPago.setHours(0, 0, 0, 0); // Ajustar la hora para comparar solo la fecha
                const key = fechaPago.toDateString();
                mapa[key] = (mapa[key] || 0) + pago.amount;
                return mapa;
            }, {});

            while (fechaPagoEsperada <= fechaFinal) {
                if (fechaPagoEsperada.getDay() !== 0) { // Omitir los domingos
                    const fechaClave = fechaPagoEsperada.toDateString();
                    const totalPagado = pagosRealizadosPorFecha[fechaClave] || 0;

                    // Aquí solo se agregan los pagos pendientes para mañana
                    if (fechaPagoEsperada.toDateString() === manana.toDateString() && totalPagado < montoCuota) {
                        pagosPendientesManana.push({
                            cliente: prestamo.clientId,
                            montoPendiente: montoCuota - totalPagado,
                            fechaEsperada: new Date(fechaPagoEsperada) // Clonar fecha para evitar referencias
                        });
                    }
                }
                fechaPagoEsperada.setDate(fechaPagoEsperada.getDate() + 1);
            }
        }
    });

    return pagosPendientesManana;
}


