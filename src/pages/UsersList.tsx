import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import { toast } from 'react-toastify';
import '../styles/usersList.css';
import { ConfirmModal } from '../components/ConfirmModal';

interface User {
    _id: string;
    email: string;
    role: string;
    isActive: boolean;
}

type SortDir = 'asc' | 'desc';

export default function UsersList() {
    const { getAccessTokenSilently } = useAuth0();
    const [users, setUsers] = useState<User[]>([]);
    const [toDeleteId, setToDeleteId] = useState<string | null>(null);
    const [toToggleId, setToToggleId] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<SortDir>('asc');

    useEffect(() => {
        (async () => {
            try {
                const token = await getAccessTokenSilently();
                const res = await axios.get<User[]>(
                    `${import.meta.env.VITE_API_URL}/admin/users`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setUsers(res.data);
            } catch {
                toast.error('No se pudo cargar la lista de usuarios');
            }
        })();
    }, [getAccessTokenSilently]);

    const confirmDelete = async () => {
        if (!toDeleteId) return;
        try {
            const token = await getAccessTokenSilently();
            await axios.delete(
                `${import.meta.env.VITE_API_URL}/admin/users/${toDeleteId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUsers(prev => prev.filter(u => u._id !== toDeleteId));
            toast.success('Usuario eliminado correctamente');
        } catch {
            toast.error('No se pudo eliminar el usuario');
        } finally {
            setToDeleteId(null);
        }
    };

    const confirmToggle = async () => {
        if (!toToggleId) return;
        try {
            const token = await getAccessTokenSilently();
            const user = users.find(u => u._id === toToggleId);
            if (!user) throw new Error();
            const { data } = await axios.patch<{
                message: string;
                user: User;
            }>(
                `${import.meta.env.VITE_API_URL}/admin/users/${toToggleId}/active`,
                { isActive: !user.isActive },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setUsers(prev =>
                prev.map(u => (u._id === toToggleId ? data.user : u))
            );
            toast.success(
                `Usuario ${data.user.isActive ? 'activado' : 'desactivado'} correctamente`
            );
        } catch {
            toast.error('No se pudo cambiar el estado del usuario');
        } finally {
            setToToggleId(null);
        }
    };

    const sortedUsers = [...users].sort((a, b) => {
        const cmp = a.email.localeCompare(b.email, 'es', { sensitivity: 'base' });
        return sortDir === 'asc' ? cmp : -cmp;
    });
    const toggleSort = () => setSortDir(dir => dir === 'asc' ? 'desc' : 'asc');

    return (
        <div className="users-container">
            <h1 className="users-title">Usuarios</h1>
            <div className="users-table-wrapper">
                <table className="users-table">
                    <thead>
                        <tr>
                            <th onClick={toggleSort} style={{ cursor: 'pointer' }}>
                                Email {sortDir === 'asc' ? '▲' : '▼'}
                            </th>
                            <th>Rol</th>
                            <th>Activo</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedUsers.map(u => (
                            <tr key={u._id}>
                                <td>{u.email}</td>
                                <td className="capitalize">{u.role}</td>
                                <td>
                                    <span className={u.isActive ? 'badge-active' : 'badge-inactive'}>
                                        {u.isActive ? 'Sí' : 'No'}
                                    </span>
                                </td>
                                <td>
                                    <button className="btn btn-toggle" onClick={() => setToToggleId(u._id)}>
                                        {u.isActive ? 'Desactivar' : 'Activar'}
                                    </button>
                                    <button className="btn btn-delete" onClick={() => setToDeleteId(u._id)}>
                                        Eliminar
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            <ConfirmModal
                isOpen={toDeleteId !== null}
                message="¿Seguro que quieres eliminar este usuario?"
                confirmText="Eliminar usuario"
                onConfirm={confirmDelete}
                onCancel={() => setToDeleteId(null)}
            />
            <ConfirmModal
                isOpen={toToggleId !== null}
                message="¿Seguro que quieres cambiar el estado de este usuario?"
                confirmText="Confirmar"
                onConfirm={confirmToggle}
                onCancel={() => setToToggleId(null)}
            />
        </div>
    );
}
