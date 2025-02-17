import React, { useState } from 'react';
import Payment from '@component/components/payment';

const Pagination = ({ itemsPerPage, payments }) => {
    const [currentPage, setCurrentPage] = useState(1);

    const totalPages = Math.ceil(payments.length / itemsPerPage);

    // Divide el arreglo de pagos en páginas
    const paginatePayments = (payments, currentPage, itemsPerPage) => {
        const startIndex = (currentPage - 1) + (itemsPerPage * (currentPage - 1));
        const endIndex = startIndex + itemsPerPage;
        return payments.slice(startIndex, endIndex);
    };

    const handlePreviousPage = () => {
        setCurrentPage(prevPage => (prevPage > 1 ? prevPage - 1 : prevPage));
    };

    const handleNextPage = () => {
        setCurrentPage(prevPage => (prevPage < totalPages ? prevPage + 1 : prevPage));
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const currentPayments = paginatePayments(payments, currentPage, itemsPerPage);
    
    return (
        <div>
            <ul className='bg-white dark:bg-slate-900'>
                {currentPayments.map((payment, index) => (
                    <Payment
                        key={payment._id}
                        payment={payment}
                        index={index}
                    />
                ))}
            </ul>

             <div className="flex justify-center space-x-2 mt-4">
                <button
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                    className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
                >
                    Previous
                </button>
                {[...Array(totalPages)].map((_, index) => (
                    <button
                        key={index}
                        onClick={() => handlePageChange(index + 1)}
                        className={`px-3 py-1 rounded ${
                            currentPage === index + 1
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                    >
                        {index + 1}
                    </button>
                ))}
                <button
                    onClick={handleNextPage}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 bg-gray-300 rounded hover:bg-gray-400 disabled:opacity-50"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default Pagination;
