// Importación de React y hooks de estado y efectos
import React, { useState, useEffect } from 'react';
// Importación del componente de paginación
import Pagination from './paginationuno';

// Componente FilterPayments que filtra y muestra los pagos
const FilterPayments = ({ payments, itemsPerPage }) => {
    // Estado para los pagos filtrados
    const [filteredPayments, setFilteredPayments] = useState(payments);
    // Estado para el filtro seleccionado (por defecto 'all')
    const [filter, setFilter] = useState('all');

    // useEffect para actualizar los pagos filtrados cuando cambien el filtro o los pagos
    useEffect(() => {
        filterPayments();
    }, [filter, payments]);

    // Función para filtrar los pagos según el filtro seleccionado
    const filterPayments = () => {
        const now = new Date(); // Fecha actual
        let filtered = payments; // Inicializa los pagos filtrados con todos los pagos

        // Filtro para los pagos de hoy
        if (filter === 'today') {
            filtered = payments.filter(payment => {
                const paymentDate = new Date(payment.date); // Convierte la fecha del pago
                return paymentDate.toDateString() === now.toDateString(); // Compara las fechas
            });
        } 
        // Filtro para los pagos de la última semana
        else if (filter === 'lastWeek') {
            const lastWeek = new Date(); // Fecha actual
            lastWeek.setDate(now.getDate() - 7); // Ajusta la fecha para una semana atrás
            filtered = payments.filter(payment => {
                const paymentDate = new Date(payment.date); // Convierte la fecha del pago
                return paymentDate >= lastWeek && paymentDate <= now; // Comprueba si está dentro del rango
            });
        } 
        // Filtro para los pagos del último mes
        else if (filter === 'lastMonth') {
            const lastMonth = new Date(); // Fecha actual
            lastMonth.setMonth(now.getMonth() - 1); // Ajusta la fecha para un mes atrás
            filtered = payments.filter(payment => {
                const paymentDate = new Date(payment.date); // Convierte la fecha del pago
                return paymentDate >= lastMonth && paymentDate <= now; // Comprueba si está dentro del rango
            });
        }

        // Actualiza el estado con los pagos filtrados
        setFilteredPayments(filtered);
    };

    return (
        <div>
            {/* Botones de filtro */}
            <div className="mb-4 flex">
                {/* Botón para mostrar todos los pagos */}
                <button
                    className={`text-black dark:text-white rounded-lg px-4 py-2 mr-2 flex-1 ${filter === 'all' ? 'bg-violet-500 text-white' : 'bg-gray-400 dark:bg-gray-500'}`}
                    onClick={() => setFilter('all')}
                >
                    Todos
                </button>
                {/* Botón para filtrar los pagos de hoy */}
                <button
                    className={`text-black dark:text-white rounded-lg px-4 py-2 mr-2 flex-1 ${filter === 'today' ? 'bg-violet-500 text-white' : 'bg-gray-400 dark:bg-gray-500'}`}
                    onClick={() => setFilter('today')}
                >
                    Hoy
                </button>
                {/* Botón para filtrar los pagos de la última semana */}
                <button
                    className={`text-black dark:text-white rounded-lg px-4 py-2 mr-2 flex-1 ${filter === 'lastWeek' ? 'bg-violet-500 text-white' : 'bg-gray-400 dark:bg-gray-500'}`}
                    onClick={() => setFilter('lastWeek')}
                >
                    Última Semana
                </button>
                {/* Botón para filtrar los pagos del último mes */}
                <button
                    className={`text-black dark:text-white rounded-lg px-4 py-2 flex-1 ${filter === 'lastMonth' ? 'bg-violet-500 text-white' : 'bg-gray-400 dark:bg-gray-500'}`}
                    onClick={() => setFilter('lastMonth')}
                >
                    Último Mes
                </button>
            </div>

            {/* Componente de paginación que muestra los pagos filtrados */}
            <Pagination itemsPerPage={itemsPerPage} payments={filteredPayments} />
        </div>
    );
};

// Exporta el componente para su uso en otros archivos
export default FilterPayments;
