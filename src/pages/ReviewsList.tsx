import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import { toast } from 'react-toastify';
import '../styles/reviewsList.css';
import { ConfirmModal } from '../components/ConfirmModal';

interface Review {
  _id: string;
  comment: string;
  rating: number;
  clientId: { firstName: string; lastName: string; };
}

type SortDir = 'asc' | 'desc';

export default function ReviewsList() {
  const { getAccessTokenSilently } = useAuth0();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [toDeleteId, setToDeleteId] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  useEffect(() => {
    (async () => {
      try {
        const token = await getAccessTokenSilently();
        const res = await axios.get<Review[]>(
            `${import.meta.env.VITE_API_URL}/reviews`,
            { headers: { Authorization: `Bearer ${token}` } }
        );
        setReviews(res.data);
      } catch {
        toast.error('No se pudieron cargar las reseñas');
      }
    })();
  }, [getAccessTokenSilently]);

  const confirmDelete = async () => {
    if (!toDeleteId) return;
    try {
      const token = await getAccessTokenSilently();
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/admin/reviews/${toDeleteId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReviews(prev => prev.filter(r => r._id !== toDeleteId));
      toast.success('Reseña eliminada correctamente');
    } catch {
      toast.error('No se pudo eliminar la reseña');
    } finally {
      setToDeleteId(null);
    }
  };

  const sortedReviews = [...reviews].sort((a, b) => {
    const nameA = `${a.clientId.firstName} ${a.clientId.lastName}`;
    const nameB = `${b.clientId.firstName} ${b.clientId.lastName}`;
    const cmp = nameA.localeCompare(nameB, 'es', { sensitivity: 'base' });
    return sortDir === 'asc' ? cmp : -cmp;
  });
  const toggleSort = () => setSortDir(dir => dir === 'asc' ? 'desc' : 'asc');

  return (
    <div className="reviews-container">
      <h1 className="reviews-title">Reseñas</h1>

      <div className="reviews-table-wrapper">
        <table className="reviews-table">
          <thead>
            <tr>
              <th onClick={toggleSort} style={{ cursor: 'pointer' }}>
                Cliente {sortDir === 'asc' ? '▲' : '▼'}
              </th>
              <th>Comentario</th>
              <th>Rating</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sortedReviews.map(r => (
              <tr key={r._id}>
                <td>{r.clientId.firstName} {r.clientId.lastName}</td>
                <td>{r.comment}</td>
                <td>{r.rating.toFixed(1)}</td>
                <td>
                  <button
                    className="btn-delete"
                    onClick={() => setToDeleteId(r._id)}
                  >
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
        message="¿Seguro que quieres eliminar esta reseña?"
        confirmText="Eliminar reseña"
        onConfirm={confirmDelete}
        onCancel={() => setToDeleteId(null)}
      />
    </div>
  );
}
