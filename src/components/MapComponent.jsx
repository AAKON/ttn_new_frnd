"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export default function MapComponent({
  latitude = "23.8103",
  longitude = "90.4125",
  onLocationChange = null,
}) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    // Initialize map
    if (!mapRef.current || mapInstanceRef.current) return;

    const lat = parseFloat(latitude) || 23.8103;
    const lng = parseFloat(longitude) || 90.4125;

    // Create map
    const map = L.map(mapRef.current).setView([lat, lng], 13);

    // Add tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    // Fix leaflet icon issue before creating marker
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
      iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
    });

    // Create custom icon
    const customIcon = L.icon({
      iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
      iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    // Add marker with custom icon
    const marker = L.marker([lat, lng], {
      draggable: true,
      title: "Location",
      icon: customIcon,
    }).addTo(map);

    // Update coordinates on marker drag
    marker.on("dragend", function (e) {
      const position = marker.getLatLng();
      if (onLocationChange) {
        onLocationChange({
          latitude: position.lat.toFixed(4),
          longitude: position.lng.toFixed(4),
        });
      }
    });

    // Update marker when map is clicked
    map.on("click", function (e) {
      marker.setLatLng(e.latlng);
      if (onLocationChange) {
        onLocationChange({
          latitude: e.latlng.lat.toFixed(4),
          longitude: e.latlng.lng.toFixed(4),
        });
      }
    });

    mapInstanceRef.current = map;
    markerRef.current = marker;
  }, []);

  // Update marker position when coordinates change
  useEffect(() => {
    if (markerRef.current && mapInstanceRef.current) {
      const lat = parseFloat(latitude);
      const lng = parseFloat(longitude);

      if (!isNaN(lat) && !isNaN(lng)) {
        markerRef.current.setLatLng([lat, lng]);
        mapInstanceRef.current.setView([lat, lng], 13);
      }
    }
  }, [latitude, longitude]);

  return (
    <div className="w-full flex flex-col">
      <div
        ref={mapRef}
        className="w-full border border-gray-200 rounded-lg overflow-hidden bg-gray-100"
        style={{ height: "380px" }}
      />
      <p className="text-xs text-blue-600 mt-2 text-center">
        Click on the map to set location or drag the marker to adjust
      </p>
    </div>
  );
}
