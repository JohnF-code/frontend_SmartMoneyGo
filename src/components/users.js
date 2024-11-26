import { useState, useEffect } from 'react'
import axios from '../config/axios';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';
import Swal from 'sweetalert2';

export default function Users() {
  
  const [users, setUsers] = useState([]);
  
   const [user, setUser] = useState({
    name: '',
    email: '',
    password: ''
  });

  const { name, email, password, role } = user;

  const handleChange = e => {
    setUser({ ...user, [e.target.name] : e.target.value })
  }

  const handleSubmit = async e => {
    e.preventDefault();

    // Validation
    try {
      if(name.trim() === '' || email.trim() === '' || password.trim() === '' || role.trim() === '') {
        toast.error('Todos los campos son obligatorios');
        return;
      }
      
      const response = await axios.post('/users/register', {...user, role: 'finanzas'});
      toast.success('Success! Welcome ' + response.data.data.name);
      
      setTimeout(() => {
          fetchUsers();
      }, 2000);
    } catch (e) {
      if(e.response.data.error.errors.email.kind === 'unique') {
        toast.error('User already exists :(');
        return;
      } else {
          toast.error('Error creating user');
      }
    }
  }
    
    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const token = window.localStorage.getItem('token');
            const config = {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            }
            const response = await axios('/users', config);
            setUsers(response.data);
        } catch (err) {
            console.error('Error obteniendo usuarios:', err);
        }
    };

    const handleDeleteUser = async (id) => {
        // Obtener Token
        const token = window.localStorage.getItem('token');
        const config = {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            }
        }


        // Confirmar Eliminación
        Swal.fire({
            title: "¿Estas seguro?",
            text: "Una vez eliminado, no podrás devolver los cambios",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Si, eliminar!"
        }).then(async (result) => {
            if (result.isConfirmed) {
                // Request
                await axios.delete(`/users/admin/${id}`, config);
                await fetchUsers(); 
                Swal.fire({
                    title: "Deleted!",
                    text: "Cliente eliminado correctamente.",
                    icon: "success"
                });
            }
        }).catch((error) => {
            console.log(error);
        })
        try {
            
        } catch (err) {
            console.error('Error eliminando usuario:', err);
        }
    };

  return (
     <div className="container mx-auto max-w-[95vw]">
      <h1 className="text-3xl font-bold mb-6">Gestión de Usuarios</h1>

      <form
          onSubmit={handleSubmit}
          className="mb-8"
      >
        <h2 className="text-2xl font-semibold mb-4">Agregar Usuario</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Nombre"
            value={name}
            name='name'
            onChange={handleChange}
            className="p-2 border border-gray-300 rounded"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            name='email'
            onChange={handleChange}
            className="p-2 border border-gray-300 rounded"
          />
          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            name='password'
            onChange={handleChange}
            className="p-2 border border-gray-300 rounded"
          />
          <select
            value={role}  
            name='role'          
            onChange={handleChange}
            className="p-2 border border-gray-300 rounded"
          >
            <option value="" disabled defaultValue={true}>-- Seleccione --</option>
            <option value="cobrador">Cobrador</option>
            <option value="finanzas">Finanzas</option>
            <option value="administrador">Administrador</option>
          </select>
        </div>
        <button
          type='submit'  
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Agregar Usuario
        </button>
      </form>

      <div className='overflow-x-auto max-w-[95vw] lg:max-w-full mx-auto'>
        <h2 className="text-2xl font-semibold mb-4">Usuarios</h2>
        <table className="min-w-full bg-white border border-gray-300">
          <thead>
            <tr>
              <th className="py-2 px-4 border-b">Nombre</th>
              <th className="py-2 px-4 border-b">Email</th>
              <th className="py-2 px-4 border-b">Rol</th>
              <th className="py-2 px-4 border-b">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id} className="hover:bg-gray-100">
                <td className="py-2 px-4 border-b">{user.name}</td>
                <td className="py-2 px-4 border-b">{user.email}</td>
                <td className="py-2 px-4 border-b">{user.role}</td>
                <td className="py-2 px-4 border-b">
                  <button
                    onClick={() => handleDeleteUser(user._id)}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
    <ToastContainer />
    </div>
  )
}