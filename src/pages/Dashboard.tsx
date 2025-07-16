import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import '../styles/Dashboard.css';

export default function Dashboard() {
    const { getAccessTokenSilently } = useAuth0();
    const [stats, setStats] = useState<Record<string, number> | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const token = await getAccessTokenSilently();
                const res = await axios.get(
                    `${import.meta.env.VITE_API_URL}/admin/stats`,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                setStats(res.data);
            } catch (error) {
                console.error('Error loading stats:', error);
            } finally {
                setLoading(false);
            }
        })();
    }, [getAccessTokenSilently]);

    if (loading) {
        return (
            <div className="admin-container">
                <div className="loading">
                    <div className="spinner"></div>
                    <div className="loading-text">Cargando métricas...</div>
                </div>
            </div>
        );
    }

    if (!stats) {
        return (
            <div className="admin-container">
                <div className="alert alert-error">
                    Error al cargar las métricas del dashboard
                </div>
            </div>
        );
    }

    return (
        <div className="admin-container">
            <div className="dashboard-header">
                <h1>Dashboard</h1>
                <p className="dashboard-subtitle">
                    Bienvenido al panel de administración de Delatte
                </p>
            </div>

            <div className="metrics-grid">
                {Object.entries(stats).map(([key, value]) => (
                    <div key={key} className="metric-card">
                        <h2>{formatMetricName(key)}</h2>
                        <div className="metric-value">{value}</div>
                        <div className="metric-change neutral">
                            <span>↗</span>
                            Actualizado hoy
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function formatMetricName(key: string): string {
    const nameMap: Record<string, string> = {
        'total_cafes': 'Total de Cafés',
        'total_users': 'Usuarios Registrados',
        'total_reviews': 'Reseñas',
        'total_favorites': 'Favoritos',
        'active_users': 'Usuarios Activos',
        'new_cafes_month': 'Cafés del Mes',
        'average_rating': 'Calificación Promedio',
        'pending_reviews': 'Reseñas Pendientes'
    };

    return nameMap[key] || key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
}