import { useState } from "react"
import { formatearFecha } from "@component/helpers";

const LoanItem = ({loan, index}) => {

    const [panel, setPanel] = useState(false);

  return (
    <li>
          <ul
              className='flex gap-x-5 items-center justify-around accordion border-b border-grey-light hover:bg-gray-100'
              onClick={() => setPanel(!panel)}
          >
            <li className="px-3 py-4">
            <p>{index}</p>
            </li>
            <li className="inline-flex items-center">
                <span className="py-3">
                      <p className="text-gray-800 text-sm">{loan.description}</p>
                    <p className="hidden md:table-cell text-xs text-gray-500 font-medium">Descripción</p>
                </span>
            </li>
            <li className="inline-flex items-center">
                <span className="py-3">
                <p className="text-gray-800 text-sm">{formatearFecha(loan.date)}</p>
                    <p className="hidden md:table-cell text-xs text-gray-500 font-medium">Fecha</p>
                </span>
            </li>
            <li className="inline-flex items-center">
                <span className="py-3">
                <p className="text-gray-800 text-sm">{loan.loanAmount}</p>
                    <p className="hidden md:table-cell text-xs text-gray-500 font-medium">Dinero Prestado</p>
                </span>
            </li>
            <li className="items-center">
                <span className="block py-3 px-5">
                {loan.terminated ? <p className="bg-red-500 text-white text-sm text-center p-2 rounded-full">Terminado</p> : <p className="bg-emerald-200 text-emerald-600 text-sm text-center p-2 rounded-full font-bold hidden md:table-cell">Activo</p>}
                </span>
            </li>
        </ul>
          <ul className={`${!panel ? 'hidden' : ''} w-full flex-col items-center`}>
              <li className='p-2 font-bold'>
                  <p className="font-light text-sm md:text-base">
                      Cantidad:
                      <span className="font-bold"> ${loan.loanAmount}</span>
                  </p>
              </li>
              <li className='p-2 font-bold'>
                  <p className="font-light text-sm md:text-base">
                      Saldo:
                      <span className="font-bold"> ${loan.balance}</span>
                  </p>
              </li>
              <li className='p-2 font-bold'>
                  <p className="font-light text-sm md:text-base">
                      Fecha Inicio:
                      <span className="font-bold"> {formatearFecha(loan.date)}</span>
                  </p>
              </li>
              <li className='p-2 font-bold'>
                  <p className="font-light text-sm md:text-base">
                      Fecha Final:
                      <span className="font-bold"> {formatearFecha(loan.finishDate)}</span>
                  </p>
              </li>
              <li className='p-2 font-bold'>
                  <p className="font-light text-sm md:text-base">
                      Interes:
                      <span className="font-bold"> {loan.interest}%</span>
                  </p>
              </li>
              <li className='p-2 font-bold'>
                  <p className="font-light text-sm md:text-base">
                      Cuotas:
                      <span className="font-bold"> {loan.installments}</span>
                  </p>
              </li>   
              <li className='p-2 font-bold'>
                {loan.terminated ? <p className="bg-red-500 text-white text-sm text-center py-2 px-6 rounded-full">Terminado</p> : <p className="bg-emerald-200 text-emerald-600 text-sm text-center py-2 px-6 rounded-full font-bold table-cell">Activo</p>}
              </li>
        </ul>
    </li>
  )
}

export default LoanItem