import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useTheme } from "next-themes";
import { getDisasters, getCenters, getDispatches } from '@/data/mockData';
// Fix default marker icons
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});
const disasterIcon = new L.DivIcon({
    className: '',
    html: `<div style="width:14px;height:14px;background:#ef4444;border-radius:50%;border:2px solid #fca5a5;box-shadow:0 0 10px #ef4444aa;"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
});
const centerIcon = new L.DivIcon({
    className: '',
    html: `<div style="width:14px;height:14px;background:#3b82f6;border-radius:3px;border:2px solid #93c5fd;box-shadow:0 0 10px #3b82f6aa;"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
});
const dispatchIcon = new L.DivIcon({
    className: '',
    html: `<div style="width:14px;height:14px;background:#22c55e;border-radius:50%;border:2px solid #86efac;box-shadow:0 0 10px #22c55eaa;"></div>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
});
export default function MapView() {
    const { theme } = useTheme();
    const data = useMemo(() => ({
        disasters: getDisasters().filter(d => d.status !== 'Resolved'),
        centers: getCenters(),
        dispatches: getDispatches().filter(d => d.status === 'In Transit' || d.status === 'Pending'),
    }), []);
    const tilesUrl = theme === "dark"
        ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
    return (<div className="space-y-4">
      <header>
        <h1 className="command-header">Operations Map</h1>
        <p className="system-label mt-1">LIVE SPATIAL OVERVIEW</p>
      </header>

      {/* Legend */}
      <div className="flex items-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-destructive"/>
          <span className="text-muted-foreground">Disaster Zones ({data.disasters.length})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-sm bg-primary"/>
          <span className="text-muted-foreground">Relief Centers ({data.centers.length})</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-success"/>
          <span className="text-muted-foreground">Active Dispatches ({data.dispatches.length})</span>
        </div>
      </div>

      {/* Map */}
      <div className="h-[calc(100vh-220px)] border border-border rounded-lg overflow-hidden relative">
        <div className="absolute top-3 left-3 z-[1000] bg-card/90 backdrop-blur px-3 py-1.5 text-[10px] font-mono text-muted-foreground border border-border rounded">
          LIVE_MAP_FEED
        </div>
        <MapContainer center={[20.5937, 78.9629]} zoom={5} className="h-full w-full" style={{ background: 'hsl(var(--background))' }}>
          <TileLayer url={tilesUrl} attribution='&copy; OpenStreetMap'/>

          {/* Disaster markers with radius */}
          {data.disasters.map(d => (<React.Fragment key={d.id}>
              <Circle center={[d.latitude, d.longitude]} radius={d.severity === 'Critical' ? 50000 : d.severity === 'High' ? 35000 : 20000} pathOptions={{ color: '#ef4444', fillColor: '#ef4444', fillOpacity: 0.1, weight: 1 }}/>
              <Marker position={[d.latitude, d.longitude]} icon={disasterIcon}>
                <Popup>
                  <div className="text-sm">
                    <div className="font-bold text-destructive">{d.type}</div>
                    <div className="text-xs mt-1">{d.location}</div>
                    <div className="text-xs mt-1">Severity: <strong>{d.severity}</strong></div>
                    <div className="text-xs">Status: {d.status}</div>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>))}

          {/* Center markers */}
          {data.centers.map(c => (<Marker key={c.id} position={[c.latitude, c.longitude]} icon={centerIcon}>
              <Popup>
                <div className="text-sm">
                  <div className="font-bold">{c.name}</div>
                  <div className="text-xs mt-1">{c.location}</div>
                  <div className="text-xs mt-1">Contact: {c.contactPerson}</div>
                </div>
              </Popup>
            </Marker>))}

          {/* Dispatch destinations */}
          {data.dispatches.map(d => (<Marker key={d.id} position={[d.destinationLat, d.destinationLng]} icon={dispatchIcon}>
              <Popup>
                <div className="text-sm">
                  <div className="font-bold text-success">{d.itemName}</div>
                  <div className="text-xs mt-1">Qty: {d.quantity}</div>
                  <div className="text-xs">→ {d.destination}</div>
                  <div className="text-xs mt-1">Status: {d.status}</div>
                </div>
              </Popup>
            </Marker>))}
        </MapContainer>
      </div>
    </div>);
}
