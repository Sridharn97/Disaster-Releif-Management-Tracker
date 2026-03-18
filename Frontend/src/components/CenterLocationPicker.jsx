import { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { OpenStreetMapProvider } from 'leaflet-geosearch';
import 'leaflet/dist/leaflet.css';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: markerIcon2x,
    iconUrl: markerIcon,
    shadowUrl: markerShadow,
});

const DEFAULT_CENTER = [20.5937, 78.9629];
const DEFAULT_ZOOM = 5;
const SELECTED_ZOOM = 13;
const provider = new OpenStreetMapProvider();

function MapClickHandler({ onSelect }) {
    useMapEvents({
        click(event) {
            onSelect({
                latitude: event.latlng.lat,
                longitude: event.latlng.lng,
            });
        },
    });

    return null;
}

function MapViewport({ coordinates }) {
    const map = useMap();

    useEffect(() => {
        if (!coordinates) {
            return;
        }

        map.flyTo([coordinates.latitude, coordinates.longitude], SELECTED_ZOOM, {
            duration: 0.6,
        });
    }, [coordinates, map]);

    return null;
}

export default function CenterLocationPicker({
    value,
    locationName,
    onChange,
}) {
    const [searchQuery, setSearchQuery] = useState(locationName || '');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [searchError, setSearchError] = useState('');

    useEffect(() => {
        setSearchQuery(locationName || '');
    }, [locationName]);

    const coordinates = useMemo(() => {
        if (value.latitude === '' || value.longitude === '') {
            return null;
        }

        return {
            latitude: Number(value.latitude),
            longitude: Number(value.longitude),
        };
    }, [value.latitude, value.longitude]);

    const mapCenter = coordinates
        ? [coordinates.latitude, coordinates.longitude]
        : DEFAULT_CENTER;

    const updateSelection = ({ latitude, longitude, label }) => {
        onChange({
            latitude: latitude.toFixed(6),
            longitude: longitude.toFixed(6),
            locationName: label || '',
        });

        if (label) {
            setSearchQuery(label);
        }
    };

    const handleCoordinateSelect = async ({ latitude, longitude }) => {
        try {
            setSearchError('');
            const results = await provider.search({
                query: `${latitude}, ${longitude}`,
            });
            updateSelection({
                latitude,
                longitude,
                label: results[0]?.label || locationName || '',
            });
        }
        catch (error) {
            updateSelection({ latitude, longitude, label: locationName || '' });
            setSearchError('Marker updated, but the location name could not be resolved');
        }
    };

    const handleSearch = async () => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        try {
            setSearchLoading(true);
            setSearchError('');
            const results = await provider.search({ query: searchQuery });
            setSearchResults(results);

            if (results[0]) {
                updateSelection({
                    latitude: Number(results[0].y),
                    longitude: Number(results[0].x),
                    label: results[0].label,
                });
            }
        }
        catch (error) {
            setSearchError('Unable to search locations right now');
            setSearchResults([]);
        }
        finally {
            setSearchLoading(false);
        }
    };

    const handleResultSelect = (result) => {
        updateSelection({
            latitude: Number(result.y),
            longitude: Number(result.x),
            label: result.label,
        });
        setSearchResults([]);
    };

    const handleSearchKeyDown = (event) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleSearch();
        }
    };

    return (
        <div className="space-y-4 sm:col-span-2 lg:col-span-3">
          <div>
            <label className="system-label mb-1.5 block">Search Location</label>
            <div className="flex gap-2">
              <input
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={handleSearchKeyDown}
                className="input-field"
                placeholder="Search city, hospital, building, or address"
              />
              <button
                type="button"
                onClick={handleSearch}
                className="btn-secondary whitespace-nowrap"
              >
                {searchLoading ? 'Searching...' : 'Search'}
              </button>
            </div>
            {searchError && (
              <div className="text-xs text-destructive mt-2">{searchError}</div>
            )}
            {searchResults.length > 1 && (
              <div className="mt-2 border border-border rounded-lg overflow-hidden bg-card">
                {searchResults.slice(0, 5).map((result) => (
                  <button
                    key={`${result.x}-${result.y}`}
                    type="button"
                    onClick={() => handleResultSelect(result)}
                    className="w-full text-left px-3 py-2 text-xs text-muted-foreground hover:bg-secondary/40 border-b border-border last:border-b-0"
                  >
                    {result.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="system-label mb-1.5 block">Select On Map</label>
            <div className="h-72 border border-border rounded-lg overflow-hidden">
              <MapContainer center={mapCenter} zoom={coordinates ? SELECTED_ZOOM : DEFAULT_ZOOM} className="h-full w-full">
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                <MapClickHandler onSelect={handleCoordinateSelect} />
                <MapViewport coordinates={coordinates} />
                {coordinates && (
                  <Marker position={[coordinates.latitude, coordinates.longitude]} />
                )}
              </MapContainer>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Click anywhere on the map to place or move the relief center marker.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="system-label mb-1.5 block">Selected Location</label>
              <div className="input-field text-muted-foreground">
                {locationName || 'No location selected'}
              </div>
            </div>
            <div>
              <label className="system-label mb-1.5 block">Latitude</label>
              <div className="input-field font-mono text-muted-foreground">
                {value.latitude || 'Not selected'}
              </div>
            </div>
            <div>
              <label className="system-label mb-1.5 block">Longitude</label>
              <div className="input-field font-mono text-muted-foreground">
                {value.longitude || 'Not selected'}
              </div>
            </div>
          </div>
        </div>
    );
}
