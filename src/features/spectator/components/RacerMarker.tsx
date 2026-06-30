import { Marker } from 'react-map-gl/mapbox'

interface RacerMarkerProps {
  coordinates: [number, number]
}

export const RacerMarker = ({ coordinates }: RacerMarkerProps) => (
  <Marker longitude={coordinates[0]} latitude={coordinates[1]}>
    <div style={{ position: 'relative', width: 20, height: 20 }}>
      {/* Pulsing ring */}
      <div style={{
        position: 'absolute',
        inset: -6,
        borderRadius: '50%',
        backgroundColor: '#C8F94E33',
        animation: 'racerPulse 2s ease-out infinite',
      }} />
      {/* Solid dot */}
      <div style={{
        width: 20,
        height: 20,
        borderRadius: '50%',
        backgroundColor: '#C8F94E',
        border: '3px solid #0C0E12',
        boxShadow: '0 2px 6px rgba(0,0,0,0.4)',
        position: 'relative',
        zIndex: 1,
      }} />
      <style>{`
        @keyframes racerPulse {
          0% { transform: scale(1); opacity: 0.6; }
          100% { transform: scale(2.5); opacity: 0; }
        }
      `}</style>
    </div>
  </Marker>
)