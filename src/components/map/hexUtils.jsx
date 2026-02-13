// Flat-top hex axial grid utilities (perfect packing)

export const SQRT3 = Math.sqrt(3);

// Axial (q, r) -> pixel (x, y) for FLAT-TOP hexes
export function hexToPixel(q, r, size) {
  const x = size * (3 / 2) * q;
  const y = size * SQRT3 * (r + q / 2);
  return { x, y };
}

// Flat-top hex path centered at (0,0)
export function hexPath(size) {
  const pts = [];
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 180) * (60 * i); // 0,60,120...
    const x = size * Math.cos(angle);
    const y = size * Math.sin(angle);
    pts.push(`${x},${y}`);
  }
  return `M ${pts.join(' L ')} Z`;
}