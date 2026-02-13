// Shared hex utilities for HexGrid and HexTile

export const hexToPixel = (q, r, size) => {
  const x = size * (3/2 * q);
  const y = size * (Math.sqrt(3)/2 * q + Math.sqrt(3) * r);
  return { x, y };
};

export const getHexRadius = (q, r) => {
  return Math.max(Math.abs(q), Math.abs(r), Math.abs(-q - r));
};

// Generate rounded hex path (used for both rendering and hit detection)
export const makeHexPath = (size, cornerRadius = 4) => {
  const points = [];
  
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    const nextAngle = (Math.PI / 3) * (i + 1) - Math.PI / 2;
    
    const px = size * Math.cos(angle);
    const py = size * Math.sin(angle);
    const nextPx = size * Math.cos(nextAngle);
    const nextPy = size * Math.sin(nextAngle);
    
    const dx = nextPx - px;
    const dy = nextPy - py;
    const length = Math.sqrt(dx * dx + dy * dy);
    const ratio = cornerRadius / length;
    
    points.push({
      start: { x: px + dx * ratio, y: py + dy * ratio },
      end: { x: nextPx - dx * ratio, y: nextPy - dy * ratio },
      corner: { x: nextPx, y: nextPy }
    });
  }
  
  return points.map((p, i) => {
    if (i === 0) {
      return `M ${p.start.x},${p.start.y} L ${p.end.x},${p.end.y}`;
    }
    return `Q ${points[i-1].corner.x},${points[i-1].corner.y} ${p.start.x},${p.start.y} L ${p.end.x},${p.end.y}`;
  }).join(' ') + ` Q ${points[points.length-1].corner.x},${points[points.length-1].corner.y} ${points[0].start.x},${points[0].start.y} Z`;
};