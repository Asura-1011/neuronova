/**
 * ChartRenderer Module
 * Renders lightweight, responsive HTML5 Canvas & SVG Cognitive Progress Charts
 * for Caregiver Dashboard (Matching User Mockup 2)
 */

const ChartRenderer = {
  renderCognitiveChart(containerId, logs, baselineAcc) {
    const container = document.getElementById(containerId);
    if (!container) return;

    if (!logs || logs.length === 0) {
      container.innerHTML = '<div style="padding:40px; text-align:center; color:var(--text-secondary);">No game logs recorded yet.</div>';
      return;
    }

    // Sort logs by date
    const sorted = [...logs].slice(-7);
    const dates = sorted.map(l => l.date.split('-').slice(1).join('/'));
    const accuracies = sorted.map(l => l.accuracy);

    // Build SVG Line Chart
    const svgWidth = 600;
    const svgHeight = 220;
    const padding = 40;
    
    const chartW = svgWidth - padding * 2;
    const chartH = svgHeight - padding * 2;

    const minVal = 0;
    const maxVal = 100;

    const points = accuracies.map((val, idx) => {
      const x = padding + (idx / Math.max(1, accuracies.length - 1)) * chartW;
      const y = svgHeight - padding - ((val - minVal) / (maxVal - minVal)) * chartH;
      return { x, y, val, date: dates[idx] };
    });

    const pathD = points.reduce((acc, p, idx) => {
      return `${acc} ${idx === 0 ? 'M' : 'L'} ${p.x} ${p.y}`;
    }, '');

    // Baseline horizontal line Y position
    const baselineY = svgHeight - padding - ((baselineAcc - minVal) / (maxVal - minVal)) * chartH;

    container.innerHTML = `
      <svg viewBox="0 0 ${svgWidth} ${svgHeight}" class="chart-canvas">
        <!-- Grid Lines -->
        <line x1="${padding}" y1="${padding}" x2="${svgWidth - padding}" y2="${padding}" stroke="var(--border-color)" stroke-dasharray="4" />
        <line x1="${padding}" y1="${svgHeight/2}" x2="${svgWidth - padding}" y2="${svgHeight/2}" stroke="var(--border-color)" stroke-dasharray="4" />
        <line x1="${padding}" y1="${svgHeight - padding}" x2="${svgWidth - padding}" y2="${svgHeight - padding}" stroke="var(--border-color)" />

        <!-- Baseline Reference Line -->
        <line x1="${padding}" y1="${baselineY}" x2="${svgWidth - padding}" y2="${baselineY}" stroke="var(--accent-amber)" stroke-width="2" stroke-dasharray="6" />
        <text x="${svgWidth - padding - 80}" y="${baselineY - 6}" fill="var(--accent-amber)" font-size="12" font-weight="bold">Baseline (${baselineAcc}%)</text>

        <!-- Dynamic Accuracy Curve -->
        <path d="${pathD}" fill="none" stroke="var(--accent-purple)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" />

        <!-- Data Points & Labels -->
        ${points.map(p => `
          <circle cx="${p.x}" cy="${p.y}" r="6" fill="var(--accent-pink)" stroke="#fff" stroke-width="2" />
          <text x="${p.x}" y="${p.y - 12}" fill="var(--text-primary)" font-size="12" font-weight="bold" text-anchor="middle">${p.val}%</text>
          <text x="${p.x}" y="${svgHeight - 12}" fill="var(--text-secondary)" font-size="11" text-anchor="middle">${p.date}</text>
        `).join('')}
      </svg>
    `;
  }
};
