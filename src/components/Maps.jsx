import { useEffect } from "react";
import maplibregl from "maplibre-gl";
import { MapLibreSearchControl } from "@stadiamaps/maplibre-search-box";
import "maplibre-gl/dist/maplibre-gl.css";
import "@stadiamaps/maplibre-search-box/dist/style.css";

const API_KEY = import.meta.env.VITE_MAPTILER_KEY;

const Maps = () => {
  useEffect(() => {
    const map = new maplibregl.Map({
      container: "map",
      style: {
        version: 8,
        sources: {
          osm: {
            type: "raster",
            tiles: ["https://a.tile.openstreetmap.org/{z}/{x}/{y}.png"],
            tileSize: 256,
            maxzoom: 19,
          },
          terrainSource: {
            type: "raster-dem",
            url: "https://demotiles.maplibre.org/terrain-tiles/tiles.json",
            tileSize: 256,
          },
          hillshadeSource: {
            type: "raster-dem",
            url: "https://demotiles.maplibre.org/terrain-tiles/tiles.json",
            tileSize: 256,
          },
          openmaptiles: {
            type: "vector",
            url: `https://api.maptiler.com/tiles/v3/tiles.json?key=${API_KEY}`,
          },
        },
        layers: [
          {
            id: "osm",
            type: "raster",
            source: "osm",
          },
          {
            id: "hills",
            type: "hillshade",
            source: "hillshadeSource",
            paint: {
              "hillshade-shadow-color": "#473B24",
            },
          },
        ],
        terrain: {
          source: "terrainSource",
          exaggeration: 1,
        },
        sky: {},
      },
      center: [11.39085, 47.27574],
      zoom: 15.5,
      pitch: 60,
      bearing: -17.6,
      maxZoom: 18,
      maxPitch: 85,
      canvasContextAttributes: { antialias: true },
    });

    // Kontrol Pencarian
    const searchControl = new MapLibreSearchControl({
    apiKey: import.meta.env.VITE_STADIA_MAPS_KEY,  
      placeholder: "Cari alamat...",
      showMarker: true,
      markerColor: "#3b82f6",
      popupBackground: "white",
      popupBorderRadius: 12,
      params: {
          'api_key': import.meta.env.VITE_STADIA_MAPS_KEY
      }
    });

    // Kontrol Geolokasi
    const geolocate = new maplibregl.GeolocateControl({
      positionOptions: { enableHighAccuracy: true },
      trackUserLocation: true,
      showUserLocation: true,
      showAccuracyCircle: false,
    });

    // Kontrol Navigasi
    const navControl = new maplibregl.NavigationControl({
      visualizePitch: true,
      showCompass: true,
      showZoom: true,
    });

    // Kontrol Terrain
    const terrainControl = new maplibregl.TerrainControl({
      source: "terrainSource",
      exaggeration: 1,
    });

    // Tambahkan semua kontrol ke top-right
    const controlPosition = "top-right";
    map.addControl(searchControl, controlPosition);
    map.addControl(geolocate, controlPosition);
    map.addControl(navControl, controlPosition);
    map.addControl(terrainControl, controlPosition);

    // Layer 3D Buildings
    map.on("load", () => {
      const layers = map.getStyle().layers;
      let labelLayerId;
      
      // Cari layer label
      for (let i = 0; i < layers.length; i++) {
        if (layers[i].type === "symbol" && layers[i].layout["text-field"]) {
          labelLayerId = layers[i].id;
          break;
        }
      }

      // Tambahkan layer bangunan 3D
      map.addLayer(
        {
          id: "3d-buildings",
          source: "openmaptiles",
          "source-layer": "building",
          type: "fill-extrusion",
          minzoom: 15,
          filter: ["!=", ["get", "hide_3d"], true],
          paint: {
            "fill-extrusion-color": [
              "interpolate",
              ["linear"],
              ["get", "render_height"],
              0,
              "#e5e7eb",
              200,
              "#60a5fa",
              400,
              "#3b82f6",
            ],
            "fill-extrusion-height": [
              "interpolate",
              ["linear"],
              ["zoom"],
              15,
              0,
              16,
              ["get", "render_height"],
            ],
            "fill-extrusion-base": [
              "case",
              [">=", ["get", "zoom"], 16],
              ["get", "render_min_height"],
              0,
            ],
            "fill-extrusion-opacity": 0.9,
          },
        },
        labelLayerId
      );
    });

    // Styling kontrol
    const styleControls = () => {
      const container = document.querySelector(".maplibregl-ctrl-top-right");
      if (container) {
        container.style.display = "flex";
        container.style.flexDirection = "column";
        container.style.gap = "8px";
        container.style.alignItems = "flex-end";
        container.style.padding = "12px";
        container.style.zIndex = "1";
      }

      // Styling individual
      document.querySelectorAll('.maplibregl-ctrl').forEach(ctrl => {
        ctrl.style.margin = "0";
        ctrl.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";
        ctrl.style.borderRadius = "12px";
        ctrl.style.overflow = "hidden";
      });
    };

    setTimeout(styleControls, 100);

    return () => map.remove();
  }, []);

  return (
    <div className="h-screen w-full relative bg-gray-50">
      <div
        id="map"
        className="h-full w-full 
          [&_.maplibregl-ctrl-top-right]:top-4
          [&_.maplibregl-ctrl-top-right]:right-4
          [&_.maplibregl-ctrl-group]:bg-white/90
          [&_.maplibregl-ctrl-group]:backdrop-blur-sm
          [&_.maplibregl-ctrl-group_button]:h-10
          [&_.maplibregl-ctrl-group_button]:w-10
          [&_.maplibregl-ctrl-group_button]:hover:bg-gray-100/80
          [&_.maplibregl-ctrl-search]:min-w-[300px]
          [&_.maplibregl-ctrl-search_input]:h-10
          [&_.maplibregl-ctrl-search_input]:rounded-xl
          [&_.maplibregl-user-location-dot]:!bg-blue-600
          [&_.maplibregl-user-location-dot]:!border-2
          [&_.maplibregl-user-location-dot]:!border-white"
      />
    </div>
  );
};

export default Maps;