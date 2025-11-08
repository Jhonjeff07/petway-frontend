// src/components/MapSelector.jsx
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import { useState, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix para los íconos de Leaflet en Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
    iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
    shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
});

// Componente para centrar el mapa cuando cambian las coords
function MapAutoCenter({ position, zoom }) {
    const map = useMap();
    useEffect(() => {
        if (position && Array.isArray(position) && position.length === 2) {
            map.setView(position, zoom ?? map.getZoom());
        }
    }, [position, zoom, map]);
    return null;
}

function LocationMarker({ position, setPosition, onChange }) {
    useMapEvents({
        click(e) {
            const lat = Number(e.latlng.lat);
            const lng = Number(e.latlng.lng);
            const newPos = [lat, lng];
            setPosition(newPos);
            onChange && onChange({ lat, lng });
        },
    });

    if (!position) return null;
    return <Marker position={position} />;
}

export default function MapSelector({ initialLat, initialLng, onChange }) {
    const [position, setPosition] = useState(
        initialLat && initialLng ? [Number(initialLat), Number(initialLng)] : null
    );

    // Si vienen initial props después (edición), actualizamos
    useEffect(() => {
        if (typeof initialLat !== 'undefined' && typeof initialLng !== 'undefined') {
            setPosition([Number(initialLat), Number(initialLng)]);
        }
    }, [initialLat, initialLng]);

    // Handler para usar ubicación del navegador
    const handleUseMyLocation = () => {
        if (!navigator.geolocation) {
            alert('Tu navegador no soporta geolocalización.');
            return;
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const lat = Number(pos.coords.latitude);
                const lng = Number(pos.coords.longitude);
                const newPos = [lat, lng];
                setPosition(newPos);
                onChange && onChange({ lat, lng });
            },
            (err) => {
                console.error('Error obteniendo ubicación:', err);
                alert('No se pudo obtener tu ubicación. Revisa permisos del navegador.');
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handleClear = () => {
        setPosition(null);
        onChange && onChange(null);
    };

    // Centro por defecto (Bogotá)
    const defaultCenter = [4.6097, -74.0817];

    return (
        <div style={{ width: '100%', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                <button type="button" onClick={handleUseMyLocation} style={{ padding: '6px 10px', borderRadius: 8 }}>
                    📍 Usar mi ubicación
                </button>
                <button type="button" onClick={handleClear} style={{ padding: '6px 10px', borderRadius: 8 }}>
                    🧹 Limpiar ubicación
                </button>
                <div style={{ marginLeft: 'auto', fontSize: 12, color: '#444', alignSelf: 'center' }}>
                    {position ? `Lat: ${position[0].toFixed(5)}, Lng: ${position[1].toFixed(5)}` : 'Selecciona una ubicación en el mapa'}
                </div>
            </div>

            <div style={{ height: 350, width: '100%' }}>
                <MapContainer
                    center={position || defaultCenter}
                    zoom={position ? 13 : 6}
                    style={{ height: '100%', width: '100%' }}
                >
                    <MapAutoCenter position={position || defaultCenter} zoom={position ? 13 : 6} />
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                    />
                    <LocationMarker position={position} setPosition={setPosition} onChange={onChange} />
                </MapContainer>
            </div>
        </div>
    );
}
