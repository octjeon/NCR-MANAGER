// Realistic industrial shipyard pipe / welding nonconformity photo illustrations as Data URLs
export function createShipyardPhotoSvg(title: string, sub: string, color: string = '#2563eb'): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="450" viewBox="0 0 600 450">
    <defs>
      <linearGradient id="pipeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#475569" />
        <stop offset="50%" stop-color="#334155" />
        <stop offset="100%" stop-color="#1e293b" />
      </linearGradient>
      <linearGradient id="weldGrad" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="#f59e0b" />
        <stop offset="50%" stop-color="#d97706" />
        <stop offset="100%" stop-color="#b45309" />
      </linearGradient>
    </defs>
    <!-- Background shipyard steel plate -->
    <rect width="600" height="450" fill="#0f172a" />
    <rect x="20" y="20" width="560" height="410" fill="#1e293b" stroke="#334155" stroke-width="2" rx="6"/>
    
    <!-- Steel pipe mockup -->
    <rect x="60" y="140" width="480" height="150" rx="12" fill="url(#pipeGrad)" stroke="#64748b" stroke-width="3" />
    <line x1="60" y1="215" x2="540" y2="215" stroke="#94a3b8" stroke-dasharray="8 6" stroke-width="2" opacity="0.6"/>
    
    <!-- Flange / joint -->
    <rect x="270" y="115" width="60" height="200" rx="8" fill="#334155" stroke="#94a3b8" stroke-width="3" />
    
    <!-- Defect marker ring -->
    <circle cx="300" cy="180" r="42" fill="none" stroke="${color}" stroke-width="4" stroke-dasharray="6 4" />
    <circle cx="300" cy="180" r="18" fill="${color}" fill-opacity="0.3" stroke="${color}" stroke-width="2" />
    
    <!-- Tag overlay -->
    <rect x="340" y="150" width="180" height="56" rx="4" fill="#020617" fill-opacity="0.85" stroke="${color}" stroke-width="1.5" />
    <text x="352" y="174" fill="#f8fafc" font-family="sans-serif" font-size="13" font-weight="bold">${title}</text>
    <text x="352" y="194" fill="#fbbf24" font-family="sans-serif" font-size="11">${sub}</text>

    <!-- Header badge -->
    <rect x="40" y="40" width="520" height="38" rx="4" fill="#020617" fill-opacity="0.9" />
    <text x="56" y="65" fill="#38bdf8" font-family="monospace" font-size="14" font-weight="bold">DAEHAN SHIPYARD QA/QC INSPECTION</text>
    <text x="440" y="65" fill="#94a3b8" font-family="monospace" font-size="12">NO. DHQ-QA</text>
    
    <!-- Scale ruler overlay -->
    <rect x="40" y="380" width="220" height="26" fill="#020617" opacity="0.8" rx="3"/>
    <text x="50" y="398" fill="#cbd5e1" font-family="monospace" font-size="11">SCALE: 1:10 (FIELD PHOTO)</text>
  </svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}
