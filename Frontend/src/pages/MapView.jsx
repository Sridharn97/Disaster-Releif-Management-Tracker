import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTheme } from "next-themes";
import api from '@/lib/api';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const createDotIcon = (background, borderRadius = '50%') => new L.DivIcon({
    className: '',
    html: `<div style="width:14px;height:14px;background:${background};border-radius:${borderRadius};border:2px solid rgba(255,255,255,0.8);box-shadow:0 0 10px ${background};"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
});

const disasterIcon = createDotIcon('#ef4444');
const centerIcon = createDotIcon('#22c55e');
const inventoryIcon = createDotIcon('#3b82f6', '3px');

export default function MapView() {
    const { theme } = useTheme();
    const [disasters, setDisasters] = useState([]);
    const [centers, setCenters] = useState([]);
    const [inventorySpaces, setInventorySpaces] = useState([]);

    useEffect(() => {
        const fetchMapData = async () => {
            try {
                const [disastersResponse, centersResponse, inventoryResponse] = await Promise.all([
                    api.get('/disasters'),
                    api.get('/centers'),
                    api.get('/inventory-spaces'),
                ]);
                setDisasters((disastersResponse.data.data || []).filter(d => d.status === 'active'));
                setCenters(centersResponse.data.data || []);
                setInventorySpaces(inventoryResponse.data.data || []);
            }
            catch (error) {
                setDisasters([]);
                setCenters([]);
                setInventorySpaces([]);
            }
        };
        fetchMapData();
    }, []);

    const tilesUrl = theme === "dark"
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";

    return (<div className="space-y-4">
      <header>
        <h1 className="command-header">Operations Map</h1>
        <p className="system-label mt-1">LIVE SPATIAL OVERVIEW</p>
      </header>

      <div className="flex items-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-destructive"/>
          <span className="text-muted-foreground">Disaster Zones ({disasters.length})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-success"/>
          <span className="text-muted-foreground">Relief Centers ({centers.length})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-primary"/>
          <span className="text-muted-foreground">Inventory Spaces ({inventorySpaces.length})</span>
        </div>
      </div>

      <div className="h-[calc(100vh-220px)] border border-border rounded-lg overflow-hidden relative">
        <div className="absolute top-3 left-3 z-[1000] bg-card/90 backdrop-blur px-3 py-1.5 text-[10px] font-mono text-muted-foreground border border-border rounded">
          LIVE_MAP_FEED
        </div>
        <MapContainer center={[20.5937, 78.9629]} zoom={5} className="h-full w-full" style={{ background: 'hsl(var(--background))' }}>
          <TileLayer url={tilesUrl} attribution='&copy; OpenStreetMap'/>

          {disasters.map(d => (<Marker key={d._id} position={[d.latitude, d.longitude]} icon={disasterIcon}>
              <Popup>
                <div className="text-sm">
                  <div className="font-bold text-destructive">{d.type}</div>
                  <div className="text-xs mt-1">{d.locationName || d.location}</div>
                  <div className="text-xs mt-1">Severity: <strong>{d.severity}</strong></div>
                  <div className="text-xs">Status: {d.status}</div>
                </div>
              </Popup>
            </Marker>))}

          {centers.map(c => (<Marker key={c._id} position={[c.latitude, c.longitude]} icon={centerIcon}>
              <Popup>
                <div className="text-sm">
                  <div className="font-bold text-success">{c.name}</div>
                  <div className="text-xs mt-1">{c.locationName || c.location}</div>
                  <div className="text-xs mt-1">Contact: {c.contactPerson}</div>
                  <div className="text-xs">Phone: {c.phone || 'N/A'}</div>
                </div>
              </Popup>
            </Marker>))}

          {inventorySpaces.map(space => (<Marker key={space._id} position={[space.latitude, space.longitude]} icon={inventoryIcon}>
              <Popup>
                <div className="text-sm">
                  <div className="font-bold text-primary">{space.name}</div>
                  <div className="text-xs mt-1">{space.locationName || space.location}</div>
                  <div className="text-xs mt-1">Manager: {space.manager}</div>
                  <div className="text-xs mt-1">Resources:</div>
                  <div className="text-xs">{(space.resources || []).map(resource => `${resource.itemName} (${resource.quantity} ${resource.unit})`).join(', ') || 'No resources'}</div>
                </div>
              </Popup>
            </Marker>))}
        </MapContainer>
      </div>
    </div>);
}
