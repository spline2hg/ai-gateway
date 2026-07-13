import React, { useState, useEffect, useMemo, useRef } from 'react';
import Globe from 'react-globe.gl';
import { MeshBasicMaterial } from 'three';
import { Activity, Zap, Eye, Radio } from 'lucide-react';const GEOJSON_URL = 'https://raw.githubusercontent.com/vasturiano/three-globe/master/example/hexed-polygons/ne_110m_admin_0_countries.geojson';

const HUBS = [
  { lat: 39, lng: -77, color: '#ffffff' },
  { lat: 53, lng: -8, color: '#ffffff' },
  { lat: 19, lng: 73, color: '#ffffff' },
  { lat: 35, lng: 140, color: '#ffffff' },
  { lat: -24, lng: -46, color: '#ffffff' },
  { lat: 1, lng: 104, color: '#ffffff' },
];

const arcsData = [
  { stLat: HUBS[0].lat, stLng: HUBS[0].lng, eLat: HUBS[1].lat, eLng: HUBS[1].lng, color: ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.3)'] },
  { stLat: HUBS[1].lat, stLng: HUBS[1].lng, eLat: HUBS[2].lat, eLng: HUBS[2].lng, color: ['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.9)'] },
  { stLat: HUBS[2].lat, stLng: HUBS[2].lng, eLat: HUBS[3].lat, eLng: HUBS[3].lng, color: ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.3)'] },
  { stLat: HUBS[0].lat, stLng: HUBS[0].lng, eLat: HUBS[4].lat, eLng: HUBS[4].lng, color: ['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.9)'] },
  { stLat: HUBS[4].lat, stLng: HUBS[4].lng, eLat: HUBS[5].lat, eLng: HUBS[5].lng, color: ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.3)'] },
  { stLat: HUBS[3].lat, stLng: HUBS[3].lng, eLat: HUBS[2].lat, eLng: HUBS[2].lng, color: ['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.9)'] },
  { stLat: HUBS[5].lat, stLng: HUBS[5].lng, eLat: HUBS[1].lat, eLng: HUBS[1].lng, color: ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.3)'] },
  { stLat: HUBS[0].lat, stLng: HUBS[0].lng, eLat: HUBS[3].lat, eLng: HUBS[3].lng, color: ['rgba(255,255,255,0.9)', 'rgba(255,255,255,0.9)'] },
];

const pointsData = HUBS.map(h => ({
  lat: h.lat, lng: h.lng, color: h.color, size: 0.3,
}));

const ringsData = HUBS.map(h => ({ lat: h.lat, lng: h.lng, color: h.color }));

const ObservabilitySection: React.FC = () => {
  const [countries, setCountries] = useState({ features: [] });
  const [size, setSize] = useState(480);
  const globeRef = useRef<any>(null);

  useEffect(() => {
    fetch(GEOJSON_URL)
      .then(res => res.json())
      .then(setCountries)
      .catch(() => {});
  }, []);

  useEffect(() => {
    const update = () => setSize(Math.min(window.innerWidth < 640 ? 320 : 480, 480));
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (globeRef.current) {
        globeRef.current.controls().autoRotate = true;
        globeRef.current.controls().autoRotateSpeed = 0.5;
        globeRef.current.pointOfView({ lat: 20, lng: -30, altitude: 2.5 });
      }
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  const globeMaterial = useMemo(() => new MeshBasicMaterial({
    color: '#000000',
  }), []);

  return (
    <section className="relative py-24 px-4 border-t border-[#1b1c1e] overflow-hidden">
      <div className="max-w-[1000px] mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-[32px] font-semibold tracking-tight text-white mb-3">
            Full-Stack Observability
          </h2>
          <p className="text-[#6a6b6c] text-[15px] max-w-lg mx-auto">
            Monitor every request, trace every token, and track latency in real-time.
          </p>
        </div>

        {/* Globe */}
        <div className="relative w-full mx-auto flex items-center justify-center" style={{ height: size }}>

          <Globe
            ref={globeRef}
            width={size}
            height={size}
            backgroundColor="rgba(0,0,0,0)"
            globeMaterial={globeMaterial}
            showAtmosphere={false}
    atmosphereColor="#ffffff"
    atmosphereAltitude={0.1}
            showGraticules={false}

            hexPolygonsData={countries.features}
            hexPolygonResolution={3}
            hexPolygonMargin={0.4}
            hexPolygonColor={() => 'rgba(255,255,255,0.35)'}
            hexPolygonAltitude={0.005}

            arcsData={arcsData}
            arcStartLat="stLat"
            arcStartLng="stLng"
            arcEndLat="eLat"
            arcEndLng="eLng"
            arcColor={'color'}
            arcAltitude={0.3}
            arcStroke={0.4}
            arcDashLength={0.5}
            arcDashGap={0.15}
            arcDashInitialGap={() => Math.random() * 3}
            arcDashAnimateTime={2500}

            pointsData={pointsData}
            pointColor="color"
            pointAltitude={0.01}
            pointRadius="size"

            ringsData={ringsData}
            ringColor={(d: any) => (t: number) => `${d.color}${Math.floor((1 - t) * 255).toString(16).padStart(2, '0')}`}
            ringMaxRadius={3}
            ringPropagationSpeed={1.5}
            ringRepeatPeriod={1500}
          />
        </div>

        {/* Feature cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-12 max-w-[800px] mx-auto">
          {[
            { icon: Activity, title: 'Request Tracing', desc: 'Every request logged with full metadata' },
            { icon: Zap, title: 'Latency Tracking', desc: 'P50/P95/P99 breakdowns per model' },
            { icon: Eye, title: 'Cost Monitoring', desc: 'Real-time spend across all providers' },
            { icon: Radio, title: 'Error Detection', desc: 'Instant alerts on failures and rate limits' },
          ].map((f, i) => {
            const Icon = f.icon;
            return (
              <div key={i} className="key-card p-4">
                <div className="w-8 h-8 rounded-full bg-[#111214] border border-[#363739] flex items-center justify-center mb-3">
                  <Icon size={15} className="text-[#e6e6e6]" />
                </div>
                <h4 className="text-[13px] font-medium text-white mb-1">{f.title}</h4>
                <p className="text-[11px] text-[#6a6b6c] leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        @keyframes pulse-label {
          0%, 100% { opacity: 0.4; }
          50% { opacity: 1; }
        }
      `}</style>
    </section>
  );
};

export default ObservabilitySection;
