import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import '../styles/cafeList.css';
import { ConfirmModal } from '../components/ConfirmModal';

interface Cafe { _id: string; name: string; address?: string; averageRating?: number; }
type SortDir = 'asc' | 'desc';

export default function CafesList() {
    const { getAccessTokenSilently } = useAuth0();
    const [cafes, setCafes] = useState<Cafe[]>([]);
    const [toDeleteId, setToDeleteId] = useState<string | null>(null);
    const [sortDir, setSortDir] = useState<SortDir>('asc');
    const navigate = useNavigate();

    useEffect(() => {
        (async () => {
            const token = await getAccessTokenSilently();
            const res = await axios.get<Cafe[]>(
                `${import.meta.env.VITE_API_URL}/cafes?limit=50`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCafes(res.data);
        })();
    }, [getAccessTokenSilently]);

    const handleView = (id: string) => navigate(`/cafes/${id}`);

    const confirmDelete = async () => {
        if (!toDeleteId) return;
        try {
            const token = await getAccessTokenSilently();
            await axios.delete(
                `${import.meta.env.VITE_API_URL}/admin/cafes/${toDeleteId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCafes(prev => prev.filter(c => c._id !== toDeleteId));

            toast.success('Café eliminado correctamente');
        } catch {
            toast.error('No se pudo eliminar el café');
        } finally {
            setToDeleteId(null);
        }
    };

    const sortedCafes = [...cafes].sort((a, b) => {
        const cmp = a.name.localeCompare(b.name, 'es', { sensitivity: 'base' });
        return sortDir === 'asc' ? cmp : -cmp;
    });

    const toggleSort = () => setSortDir(dir => dir === 'asc' ? 'desc' : 'asc');

    return (
        <div className="cafes-container">
            <h1 className="cafes-title">Cafés</h1>
            <div className="cafes-table-wrapper">
                <table className="cafes-table">
                    <thead>
                        <tr>
                            <th onClick={toggleSort} style={{ cursor: 'pointer' }}>
                                Nombre {sortDir === 'asc' ? '▲' : '▼'}
                            </th>
                            <th>Dirección</th>
                            <th>Rating</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedCafes.map(c => (
                            <tr key={c._id}>
                                <td>{c.name}</td>
                                <td>{c.address ?? '–'}</td>
                                <td>{c.averageRating?.toFixed(1) ?? '–'}</td>
                                <td>
                                    <div className="cafes-actions">
                                        <button className="btn btn-view" onClick={() => handleView(c._id)}>Ver</button>
                                        <button className="btn btn-delete" onClick={() => setToDeleteId(c._id)}>Eliminar</button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <ConfirmModal
                isOpen={toDeleteId !== null}
                message="¿Seguro que quieres eliminar este café?"
                onConfirm={confirmDelete}
                onCancel={() => setToDeleteId(null)}
            />
        </div>
    );
}
