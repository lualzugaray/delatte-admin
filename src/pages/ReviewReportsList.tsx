import { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import { toast } from 'react-toastify';
import '../styles/reviewReportsList.css';
import { ConfirmModal } from '../components/ConfirmModal';

interface ReviewReport {
  _id: string;
  reason: string;
  status: 'pending' | 'reviewed' | 'dismissed';
  managerId: { fullName: string };
  reviewId: { _id: string; comment: string; rating: number } | null;
}

type SortDir = 'asc' | 'desc';

export default function ReviewReportsList() {
  const { getAccessTokenSilently } = useAuth0();
  const [reports, setReports] = useState<ReviewReport[]>([]);
  const [activeConfirm, setActiveConfirm] = useState<{ id: string; action: 'reviewed' | 'dismissed' | 'deleteReview' } | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>('asc');

  // Cargar reportes
  useEffect(() => {
    (async () => {
      try {
        const token = await getAccessTokenSilently();
        const res = await axios.get<ReviewReport[]>(
          `${import.meta.env.VITE_API_URL}/admin/review-reports`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setReports(res.data);
      } catch {
        toast.error('No se pudieron cargar los reportes');
      }
    })();
  }, [getAccessTokenSilently]);

  // Acciones sobre reportes
  const handleAction = async () => {
    if (!activeConfirm) return;
    const { id, action } = activeConfirm;
    const token = await getAccessTokenSilently();
    try {
      // Define newStatus for both dismiss and review
      let newStatus: ReviewReport['status'];
      if (action === 'deleteReview') {
        // eliminar reseña si existe
        const report = reports.find(r => r._id === id);
        if (report?.reviewId?._id) {
          await axios.delete(
            `${import.meta.env.VITE_API_URL}/admin/reviews/${report.reviewId._id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          toast.success('Reseña eliminada');
        }
        newStatus = 'reviewed';
      } else {
        newStatus = action;
      }

      // actualizar solo el status sin perder managerId ni reviewId
      await axios.patch(
        `${import.meta.env.VITE_API_URL}/admin/review-reports/${id}`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReports(prev =>
        prev.map(r =>
          r._id === id ? { ...r, status: newStatus } : r
        )
      );
      toast.success(
        action === 'dismissed'
          ? 'Reporte ignorado'
          : 'Reporte marcado como revisado'
      );
    } catch {
      toast.error('Error al procesar la acción');
    } finally {
      setActiveConfirm(null);
    }
  };

  // Ordenar por manager
  const sorted = [...reports].sort((a, b) => {
    const nA = a.managerId.fullName;
    const nB = b.managerId.fullName;
    const cmp = nA.localeCompare(nB, 'es', { sensitivity: 'base' });
    return sortDir === 'asc' ? cmp : -cmp;
  });
  const toggleSort = () => setSortDir(d => (d === 'asc' ? 'desc' : 'asc'));

  return (
    <div className="rr-container">
      <h1 className="rr-title">Reportes de Reseñas</h1>

      <div className="rr-table-wrapper">
        <table className="rr-table">
          <thead>
            <tr>
              <th onClick={toggleSort} className="rr-sortable">
                Reportero {sortDir === 'asc' ? '▲' : '▼'}
              </th>
              <th>Reseña</th>
              <th>Razón</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map(r => (
              <tr key={r._id} className="rr-row">
                <td>{r.managerId.fullName}</td>
                <td className="rr-review">
                  {r.reviewId?.comment ?? '— sin reseña —'}
                </td>
                <td className="rr-reason">{r.reason}</td>
                <td>
                  <span className={`rr-badge rr-${r.status}`}>{
                    r.status.charAt(0).toUpperCase() + r.status.slice(1)
                  }</span>
                </td>
                <td className="rr-actions">
                  {r.status === 'pending' && (
                    <>
                      <button
                        className="btn-delete-review"
                        onClick={() => setActiveConfirm({ id: r._id, action: 'deleteReview' })}
                      >
                        Eliminar Reseña
                      </button>
                      <button
                        className="btn-ignore"
                        onClick={() => setActiveConfirm({ id: r._id, action: 'dismissed' })}
                      >
                        Ignorar
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        isOpen={activeConfirm !== null}
        message={
          activeConfirm?.action === 'deleteReview'
            ? '¿Eliminar la reseña reportada?'
            : '¿Deseas ignorar este reporte?'
        }
        confirmText={
          activeConfirm?.action === 'deleteReview' ? 'Eliminar' : 'Ignorar'
        }
        onConfirm={handleAction}
        onCancel={() => setActiveConfirm(null)}
      />
    </div>
  );
}
