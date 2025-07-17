import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import { toast } from 'react-toastify';
import '../styles/cafeDetail.css';
import { ConfirmModal } from '../components/ConfirmModal';

interface Review {
  _id: string;
  rating: number;
  comment: string;
  clientId: { firstName: string; lastName?: string; profilePicture?: string };
  createdAt: string;
}
interface CafeDetailData {
  _id: string;
  name: string;
  address?: string;
  description?: string;
  averageRating?: number;
  coverImage?: string;
}

export default function CafeDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { getAccessTokenSilently } = useAuth0();

  const [cafe, setCafe] = useState<CafeDetailData | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // Para el modal:
  const [toDelete, setToDelete] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const token = await getAccessTokenSilently();
      try {
        const { data } = await axios.get<CafeDetailData & { reviews: Review[] }>(
          `${import.meta.env.VITE_API_URL}/cafes/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCafe(data);
        setReviews(data.reviews);
      } catch {
        toast.error('No se pudo cargar el café');
      } finally {
        setLoading(false);
      }
    })();
  }, [id, getAccessTokenSilently]);

  // Borrado real tras confirmación
  const handleDelete = async () => {
    try {
      const token = await getAccessTokenSilently();
      await axios.delete(
        `${import.meta.env.VITE_API_URL}/admin/cafes/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Café eliminado correctamente');
      navigate('/cafes');
    } catch {
      toast.error('Error al eliminar el café');
    }
  };

  if (loading) return <p className="cd-loading">Cargando...</p>;
  if (!cafe) return null;

  return (
    <div className="cd-container">
      <button className="cd-back" onClick={() => navigate(-1)}>
        ← Volver
      </button>
      <h1 className="cd-title">{cafe.name}</h1>
      {cafe.address && <p className="cd-address">📍 {cafe.address}</p>}
      {cafe.description && <p className="cd-desc">{cafe.description}</p>}
      {cafe.averageRating !== undefined && (
        <p className="cd-rating">⭐ {cafe.averageRating.toFixed(1)}</p>
      )}

      <h2 className="cd-section-title">Reseñas</h2>
      {reviews.length ? (
        <ul className="cd-reviews">
          {reviews.map(r => (
            <li key={r._id} className="cd-review">
              <div className="cd-review-header">
                {r.clientId.profilePicture && (
                  <img src={r.clientId.profilePicture} alt="avatar" className="cd-avatar" />
                )}
                <span className="cd-review-author">
                  {r.clientId.firstName} {r.clientId.lastName ?? ''}
                </span>
                <span className="cd-review-rating">{r.rating}⭐</span>
              </div>
              <p className="cd-review-comment">{r.comment}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p className="cd-no-reviews">Aún no hay reseñas</p>
      )}

      <div className="cd-actions">
        <button className="btn-delete" onClick={() => setToDelete(true)}>
          Eliminar Café
        </button>
      </div>

      <ConfirmModal
        isOpen={toDelete}
        message="¿Eliminar este café definitivamente?"
        onConfirm={() => { setToDelete(false); handleDelete(); }}
        onCancel={() => setToDelete(false)}
      />
    </div>
  );
}
