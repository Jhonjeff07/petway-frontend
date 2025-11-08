// src/components/MapSelector.jsx
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
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

function LocationMarker({ onChange }) {
    const [position, setPosition] = useState(null);

    useMapEvents({
        click(e) {
            setPosition(e.latlng);
            onChange(e.latlng); // envia lat/lng al padre
        },
    });

    return position === null ? null : <Marker position={position}></Marker>;
}

export default function MapSelector({ initialLat, initialLng, onChange }) {
    const [position, setPosition] = useState(
        initialLat && initialLng ? [initialLat, initialLng] : [4.6097, -74.0817] // Bogotá por defecto
    );

    useEffect(() => {
        if (initialLat && initialLng) {
            setPosition([initialLat, initialLng]);
        }
    }, [initialLat, initialLng]);

    return (
        <div style={{ height: '350px', width: '100%', borderRadius: '10px', overflow: 'hidden' }}>
            <MapContainer
                center={position}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
            >
                <TileLayer
                    url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />
                <LocationMarker onChange={onChange} />
            </MapContainer>
        </div>
    );
}
