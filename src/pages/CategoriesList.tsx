import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import { toast } from 'react-toastify';
import '../styles/categoriesList.css';
import { ConfirmModal } from '../components/ConfirmModal';

interface Category {
    id: string;
    name: string;
    isActive: boolean;
}

type SortDir = 'asc' | 'desc'

export default function CategoriesList() {
    const { getAccessTokenSilently } = useAuth0();
    const [cats, setCats] = useState<Category[]>([]);
    const [sortDir, setSortDir] = useState<SortDir>('asc')
    const [toDeleteId, setToDeleteId] = useState<string | null>(null);
    const [toToggleId, setToToggleId] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            try {
                const token = await getAccessTokenSilently();
                const res = await axios.get<Category[]>(
                    `${import.meta.env.VITE_API_URL}/categories`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setCats(res.data);
            } catch {
                toast.error('No se pudo cargar las categorías');
            }
        })();
    }, [getAccessTokenSilently]);

    const confirmDelete = async () => {
        if (!toDeleteId) return;
        try {
            const token = await getAccessTokenSilently();
            await axios.delete(
                `${import.meta.env.VITE_API_URL}/admin/categories/${toDeleteId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCats(prev => prev.filter(c => c.id !== toDeleteId));
            toast.success('Categoría eliminada correctamente');
        } catch {
            toast.error('No se pudo eliminar la categoría');
        } finally {
            setToDeleteId(null);
        }
    };

    const confirmToggle = async () => {
        if (!toToggleId) return;
        try {
            const token = await getAccessTokenSilently();
            const cat = cats.find(c => c.id === toToggleId);
            if (!cat) throw new Error();
            const { data } = await axios.patch<{ message: string; category: Category }>(
                `${import.meta.env.VITE_API_URL}/admin/categories/${toToggleId}/active`,
                { isActive: !cat.isActive },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setCats(prev =>
                prev.map(c => (c.id === toToggleId ? data.category : c))
            );
            toast.success(
                `Categoría ${data.category.isActive ? 'activada' : 'desactivada'} correctamente`
            );
        } catch {
            toast.error('No se pudo cambiar el estado de la categoría');
        } finally {
            setToToggleId(null);
        }
    };

    const sortedCats = [...cats].sort((a, b) => {
        const cmp = a.name.localeCompare(b.name, 'es', { sensitivity: 'base' })
        return sortDir === 'asc' ? cmp : -cmp
    })

    const handleSortClick = () => {
        setSortDir(dir => (dir === 'asc' ? 'desc' : 'asc'))
    }

    return (
        <div className="cats-container">
            <h1 className="cats-title">Categorías</h1>

            <div className="cats-table-wrapper">
                <table className="cats-table">
                    <thead>
                        <tr>
                            <th onClick={handleSortClick} style={{ cursor: 'pointer' }}>
                                Nombre {sortDir === 'asc' ? '▲' : '▼'}
                            </th>
                            <th>Activo</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedCats.map(c => (
                            <tr key={c.id}>
                                <td>{c.name}</td>
                                <td>
                                    <span className={c.isActive ? 'badge-active' : 'badge-inactive'}>
                                        {c.isActive ? 'Sí' : 'No'}
                                    </span>
                                </td>
                                <td className="cats-actions">
                                    <button className="btn-toggle" onClick={() => setToToggleId(c.id)}>
                                        {c.isActive ? 'Desactivar' : 'Activar'}
                                    </button>
                                    <button className="btn-delete" onClick={() => setToDeleteId(c.id)}>
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
                message="¿Seguro que quieres eliminar esta categoría?"
                confirmText="Eliminar categoría"
                onConfirm={confirmDelete}
                onCancel={() => setToDeleteId(null)}
            />
            <ConfirmModal
                isOpen={toToggleId !== null}
                message="¿Seguro que quieres cambiar el estado de esta categoría?"
                confirmText="Confirmar"
                onConfirm={confirmToggle}
                onCancel={() => setToToggleId(null)}
            />
        </div>
    );
}
