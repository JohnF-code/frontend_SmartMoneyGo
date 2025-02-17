import { useState } from "react"
import { formatearFecha, formatearNumero } from "@component/helpers";

const LoanItem = ({ loan, index }) => {

    const [panel, setPanel] = useState(false);

    return ( <
        li >
        <
        ul className = 'flex items-center justify-around border-b gap-x-5 accordion border-grey-light hover:bg-gray-100'
        onClick = {
            () => setPanel(!panel)
        } >
        <
        li className = "px-3 py-4" >
        <
        p > { index } < /p> < /
        li > <
        li className = "inline-flex items-center" >
        <
        span className = "py-3" >
        <
        p className = "text-sm text-gray-800" > { loan.description } < /p> <
        p className = "hidden text-xs font-medium text-gray-500 md:table-cell" > Descripción < /p> < /
        span > <
        /li> <
        li className = "inline-flex items-center" >
        <
        span className = "py-3" >
        <
        p className = "text-sm text-gray-800" > { formatearFecha(loan.date) } < /p> <
        p className = "hidden text-xs font-medium text-gray-500 md:table-cell" > Fecha < /p> < /
        span > <
        /li> <
        li className = "inline-flex items-center" >
        <
        span className = "py-3" >
        <
        p className = "text-sm text-gray-800" > { formatearNumero(loan.loanAmount) } < /p> <
        p className = "hidden text-xs font-medium text-gray-500 md:table-cell" > Dinero Prestado < /p> < /
        span > <
        /li> <
        li className = "items-center" >
        <
        span className = "block px-5 py-3" > { loan.terminated ? < p className = "p-2 text-sm text-center text-white bg-red-500 rounded-full" > Terminado < /p> : <p className="hidden p-2 text-sm font-bold text-center rounded-full bg-emerald-200 text-emerald-600 md:table-cell">Activo</p > } <
        /span> < /
        li > <
        /ul> <
        ul className = { `${!panel ? 'hidden' : ''} w-full flex-col items-center` } >
        <
        li className = 'p-2 font-bold' >
        <
        p className = "text-sm font-light md:text-base" >
        Cantidad:
        <
        span className = "font-bold" > $ { formatearNumero(loan.loanAmount) } < /span> < /
        p > <
        /li> <
        li className = 'p-2 font-bold' >
        <
        p className = "text-sm font-light md:text-base" >
        Saldo:
        <
        span className = "font-bold" > $ { formatearNumero(loan.balance) } < /span> < /
        p > <
        /li> <
        li className = 'p-2 font-bold' >
        <
        p className = "text-sm font-light md:text-base" >
        Fecha Inicio:
        <
        span className = "font-bold" > { formatearFecha(loan.date) } < /span> < /
        p > <
        /li> <
        li className = 'p-2 font-bold' >
        <
        p className = "text-sm font-light md:text-base" >
        Fecha Final:
        <
        span className = "font-bold" > { formatearFecha(loan.finishDate) } < /span> < /
        p > <
        /li> <
        li className = 'p-2 font-bold' >
        <
        p className = "text-sm font-light md:text-base" >
        Interes:
        <
        span className = "font-bold" > { loan.interest } % < /span> < /
        p > <
        /li> <
        li className = 'p-2 font-bold' >
        <
        p className = "text-sm font-light md:text-base" >
        Cuotas:
        <
        span className = "font-bold" > { loan.installments } < /span> < /
        p > <
        /li>    <
        li className = 'p-2 font-bold' > { loan.terminated ? < p className = "px-6 py-2 text-sm text-center text-white bg-red-500 rounded-full" > Terminado < /p> : <p className="table-cell px-6 py-2 text-sm font-bold text-center rounded-full bg-emerald-200 text-emerald-600">Activo</p > } <
        /li> < /
        ul > <
        /li>
    )
}

export default LoanItem