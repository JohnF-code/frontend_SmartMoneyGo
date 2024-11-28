import { Fragment, useState, useContext } from 'react'
import { Dialog, DialogPanel, DialogTitle, Transition, TransitionChild } from '@headlessui/react'
import { ClientsContext } from '../contexts/ClientsContext'
import { toast } from 'react-toastify';
import { calculateEndDate } from '../helpers';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLocationDot } from '@fortawesome/free-solid-svg-icons';
import LocationMap from './locationMap';

const ModalClient = ({ showModal, setShowModal, client, cleanClient }) => {

    // Context State
    const clientsContext = useContext(ClientsContext);
    
    const { clients, addClient, updateClient } = clientsContext;

    // State
    const [data, setData] = useState({
        name: client?.name || '',
        contact: client?.contact || '',
        document: client?.document || '',
        location: client?.coordinates || ''
    });

    const [alert, showAlert] = useState(false);
    const [message, setMessage] = useState('');

    const [openLocation, setOpenLocation] = useState(false);
    const [location, setLocation] = useState({
        lat: client.coordinates ? client.coordinates[0] : 0,
        lng: client.coordinates ? client.coordinates[1] : 0
    });  // Inicializa con coordenadas de ejemplo

    const handleChange = e =>  {
        setData({ ...data, [e.target.name] : e.target.value })
    }

    const handleSubmit = async e => {
        e.preventDefault();

        // Validation
        const { name, document, contact } = data;
        if (name.trim() === '' || contact.trim() === '' || document.trim() === '') {
            setMessage('Todos los campos son obligatorios')
            showAlert(true);
            setTimeout(() => {
                showAlert(false);
            }, 3000);
            return;
        }

        if (client.name) {
            console.log(client);
            console.log('LOC', location);
            // Estamos editando...
            data.coordinates = [location.lat, location.lng];
            const res = await updateClient({
                ...data,
                id: client._id
            })
            
            // Clean CLient
            cleanClient();

            // Clean Fields
            setData({
                name: '',
                contact: '',
                document: '',
                loanAmount: '',
                interest: '',
                installments: ''
            });
            
            // Close Modal
            setShowModal(false);
            toast.success(res.msg);
            return;
        }

        // Verificar si ya hay un cliente con este número de cedula
        const isClient = clients.find(data => data.document === document);
        console.log(isClient);

        // Si existe, entonces verficar si ya ha sido terminado
        // Solo se puede abrir un nuevo prestamo, una vez el anterior haya culminado
        if (isClient) {
            // No se pueden tener dos prestamos en curso
            setMessage('Ya hay otro cliente con este número de cedula')
            showAlert(true);
            setTimeout(() => {
                showAlert(false);
            }, 3000);
            return;
        }
        // Request Context
        await addClient({
            ...data,
            date: Date.now(),
        });

        // Clean Fields
        setData({
            name: '',
            contact: '',
            document: '',
            loanAmount: '',
            interest: '',
            installments: ''
        });
        
        // Close Modal
        setShowModal(false);
        
    }

    const handleClose = () => {
        cleanClient();
        setShowModal(false);
    }

    const showLocationModal = () => {
        setLocation({
            lat: client.coordinates[0],
            lng: client.coordinates[1]
        })
        setOpenLocation(true);
    }

     const handleSaveLocation = (newLocation) => {
        console.log('Nueva ubicación guardada:', newLocation);
        // Aquí deberías hacer una llamada a la base de datos o API para guardar los datos
        setLocation(newLocation);
    };

  return (
    <>
    <Transition appear show={showModal} as={Fragment}>
        <Dialog
          open={showModal}
          transition
          className='fixed inset-0 flex w-screen items-center justify-center p-4 z-200'
          onClose={() => setShowModal(false)}
        >
          <TransitionChild
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-70" />
          </TransitionChild>
            {/* Modal content */}
            <DialogPanel className="relative z-10 bg-white rounded-lg shadow dark:bg-gray-700">
              {/* Modal header */}
              <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t dark:border-gray-600">
                  <DialogTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    {client?.name ? 'Editar Cliente' : 'Crear Nuevo Cliente'}
                  </DialogTitle>
                  <button type="button" className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ms-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white" onClick={handleClose}>
                      <svg className="w-3 h-3" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                          <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                      </svg>
                      <span className="sr-only">Close modal</span>
                  </button>
              </div>

              {/* Modal Body */}
              <form className="p-4 md:p-5" onSubmit={handleSubmit}>
                { alert ? (
                    <div className='p-2 bg-red-200 text-center mb-2'>
                              <p className='text-red-600 font-black'>{message}</p>
                    </div>
                ) : '' }
                  <div className="grid gap-4 mb-4 grid-cols-2">
                    <div className="col-span-2">
                        <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Name</label>
                        <input type="text" name="name" id="name" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Ingresar nombre completo" required="" value={data?.name} onChange={handleChange} />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label htmlFor="contact" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Telefono</label>
                        <input type="text" name="contact" id="contact" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Número de teléfono" required="" value={data?.contact} onChange={handleChange} />
                    </div>
                    <div className="col-span-2 sm:col-span-1">
                        <label htmlFor="document" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Cédula</label>
                        <input type="number" name="document" id="document" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-600 dark:border-gray-500 dark:placeholder-gray-400 dark:text-white dark:focus:ring-primary-500 dark:focus:border-primary-500" placeholder="Número de cedula" required="" value={data?.document} onChange={handleChange} />
                    </div>
                  </div>
                    {client.name ? (
                        <div className="col-span-2">
                            <button
                                type='button'
                                className='block px-4 py-3 text-blue-600 bg-white font-bold uppercase text-sm mb-5 w-full border-blue-600 border-2 rounded-full transition-all hover:bg-blue-600 hover:text-white'
                                onClick={showLocationModal}
                            >
                                Editar Ubicación {' '}
                                <FontAwesomeIcon icon={faLocationDot} />
                            </button>
                        </div>
                    ) : ''}
                  <button
                    type="submit"
                    className="text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                  >
                      <svg className="me-1 -ms-1 w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path></svg>
                      {client?.name ? 'Guardar Cambios' : 'Añadir Cliente' }
                  </button>
              </form>
            </DialogPanel>
        </Dialog>
    </Transition>
    {openLocation ? (
        <LocationMap
            openLocation={openLocation}
            setOpenLocation={setOpenLocation}
            initialLocation={location}
            onSave={handleSaveLocation}
        />
    ) : ''}
    </>
  )
}

export default ModalClient