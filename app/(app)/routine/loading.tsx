export default function Loading() {
  return (
    <div style={{ background: '#F7F7F5', minHeight: '100dvh', paddingBottom: 100 }}>
      {/* Header skeleton */}
      <div style={{ height: 56, background: '#FFFFFF', borderBottom: '1px solid #EBEBEA', padding: '0 20px', display: 'flex', alignItems: 'center' }}>
        <div style={{ width: 120, height: 18, borderRadius: 8, background: 'linear-gradient(90deg, #EBEBEA 25%, #F5F5F3 50%, #EBEBEA 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.2s infinite' }} />
      </div>
      {/* Content skeletons */}
      <div style={{ padding: '20px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[1,2,3].map(i => (
          <div key={i} style={{ background: '#FFFFFF', borderRadius: 20, padding: 20, border: '1px solid #EBEBEA' }}>
            <div style={{ width: '60%', height: 16, borderRadius: 8, background: '#EBEBEA', marginBottom: 12 }} />
            <div style={{ width: '100%', height: 12, borderRadius: 6, background: '#F2F2F0', marginBottom: 8 }} />
            <div style={{ width: '80%', height: 12, borderRadius: 6, background: '#F2F2F0' }} />
          </div>
        ))}
      </div>
      <style>{`@keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }`}</style>
    </div>
  )
}
