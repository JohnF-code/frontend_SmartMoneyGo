import React, { useState, useEffect } from 'react';
import Pagination from './pagination';

const FilterPayments = ({ payments, itemsPerPage }) => {
    const [filteredPayments, setFilteredPayments] = useState(payments);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        filterPayments();
    }, [filter, payments]);

    const filterPayments = () => {
        const now = new Date();
        let filtered = payments;

        if (filter === 'today') {
            filtered = payments.filter(payment => {
                const paymentDate = new Date(payment.date);
                return paymentDate.toDateString() === now.toDateString();
            });
        } else if (filter === 'lastWeek') {
            const lastWeek = new Date();
            lastWeek.setDate(now.getDate() - 7);
            filtered = payments.filter(payment => {
                const paymentDate = new Date(payment.date);
                return paymentDate >= lastWeek && paymentDate <= now;
            });
        } else if (filter === 'lastMonth') {
            const lastMonth = new Date();
            lastMonth.setMonth(now.getMonth() - 1);
            filtered = payments.filter(payment => {
                const paymentDate = new Date(payment.date);
                return paymentDate >= lastMonth && paymentDate <= now;
            });
        }

        setFilteredPayments(filtered);
    };

    return (
        <div>
            <div className="mb-4 flex">
                <button
                    className={`text-black dark:text-white rounded-lg px-4 py-2 mr-2 flex-1 ${filter === 'all' ? 'bg-blue-500 text-white' : 'bg-gray-400 dark:bg-gray-500'}`}
                    onClick={() => setFilter('all')}
                >
                    Todos
                </button>
                <button
                    className={`text-black dark:text-white rounded-lg px-4 py-2 mr-2 flex-1 ${filter === 'today' ? 'bg-blue-500 text-white' : 'bg-gray-400 dark:bg-gray-500'}`}
                    onClick={() => setFilter('today')}
                >
                    Hoy
                </button>
                <button
                    className={`text-black dark:text-white rounded-lg px-4 py-2 mr-2 flex-1 ${filter === 'lastWeek' ? 'bg-blue-500 text-white' : 'bg-gray-400 dark:bg-gray-500'}`}
                    onClick={() => setFilter('lastWeek')}
                >
                    Última Semana
                </button>
                <button
                    className={`text-black dark:text-white rounded-lg px-4 py-2 flex-1 ${filter === 'lastMonth' ? 'bg-blue-500 text-white' : 'bg-gray-400 dark:bg-gray-500'}`}
                    onClick={() => setFilter('lastMonth')}
                >
                    Último Mes
                </button>
            </div>

            <Pagination itemsPerPage={itemsPerPage} payments={filteredPayments} />
        </div>
    );
};

export default FilterPayments;