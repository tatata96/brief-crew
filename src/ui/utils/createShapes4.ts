import { Bodies, Body } from "matter-js";

/** Shared store shape -> metadata */
export type ShapeStore = Map<Body, any>;
const common = (isStatic: boolean) =>
  ({ restitution: 0.4, friction: 0.4, isStatic, render: { visible: false } });

/**
 * Utility function to generate a darker version of a color for text
 * @param backgroundColor - The background color (hex, rgb, or named color)
 * @param darkenAmount - How much to darken (0-1, default 0.7)
 * @returns A darker hex color string
 */
function getDarkerTextColor(backgroundColor: string, darkenAmount: number = 0.7): string {
  // Handle hex colors
  if (backgroundColor.startsWith('#')) {
    const hex = backgroundColor.slice(1);
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    
    const darkerR = Math.max(0, Math.floor(r * (1 - darkenAmount)));
    const darkerG = Math.max(0, Math.floor(g * (1 - darkenAmount)));
    const darkerB = Math.max(0, Math.floor(b * (1 - darkenAmount)));
    
    return `#${darkerR.toString(16).padStart(2, '0')}${darkerG.toString(16).padStart(2, '0')}${darkerB.toString(16).padStart(2, '0')}`;
  }
  
  // Handle rgb/rgba colors
  if (backgroundColor.startsWith('rgb')) {
    const match = backgroundColor.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      const r = parseInt(match[1]);
      const g = parseInt(match[2]);
      const b = parseInt(match[3]);
      
      const darkerR = Math.max(0, Math.floor(r * (1 - darkenAmount)));
      const darkerG = Math.max(0, Math.floor(g * (1 - darkenAmount)));
      const darkerB = Math.max(0, Math.floor(b * (1 - darkenAmount)));
      
      return `rgb(${darkerR}, ${darkerG}, ${darkerB})`;
    }
  }
  
  // Handle named colors - convert to a reasonable dark color
  const namedColorMap: { [key: string]: string } = {
    'red': '#8B0000',
    'green': '#006400',
    'blue': '#00008B',
    'yellow': '#B8860B',
    'orange': '#8B4513',
    'purple': '#4B0082',
    'pink': '#8B008B',
    'cyan': '#008B8B',
    'teal': '#008080',
    'indigo': '#4B0082',
    'violet': '#8A2BE2',
    'emerald': '#006400',
    'lime': '#556B2F',
    'amber': '#B8860B',
    'sky': '#0066CC',
    'fuscia': '#8B008B',
    'white': '#333333',
    'black': '#000000',
    'gray': '#333333',
    'grey': '#333333'
  };
  
  const lowerColor = backgroundColor.toLowerCase();
  if (namedColorMap[lowerColor]) {
    return namedColorMap[lowerColor];
  }
  
  // Fallback to a dark color
  return '#0B1220';
}

/* =========================
   1) SOLID CIRCLE (with optional center text)
   ========================= */
type DotOpts = {
  fill?: string;
  outline?: string | null;
  outlineWidth?: number;
  text?: string;
  font?: string;
  textColor?: string;
};
export const createDot = (
  x: number, y: number, r: number,
  opts: DotOpts = {}, isStatic = false, shapeData: ShapeStore
) => {
  const body = Bodies.circle(x, y, r, common(isStatic));
  shapeData.set(body, {
    type: "dot", r,
    ...{ fill: "#E11D1D", outline: null, outlineWidth: 2, text: "", font: "900 44px Inter", textColor: getDarkerTextColor("#E11D1D") },
    ...opts
  });
  return body;
};

export const renderDot = (ctx: CanvasRenderingContext2D, body: Body, shapeData: ShapeStore) => {
  const d = shapeData.get(body);
  if (!d || d.type !== "dot") return;
  const { x, y } = body.position;
  ctx.save();
  ctx.translate(x, y);
  ctx.beginPath();
  ctx.arc(0, 0, d.r, 0, Math.PI * 2);
  ctx.fillStyle = d.fill;
  ctx.fill();
  if (d.outline) { ctx.lineWidth = d.outlineWidth; ctx.strokeStyle = d.outline; ctx.stroke(); }
  if (d.text) { ctx.fillStyle = d.textColor; ctx.font = d.font; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(d.text, 0, 0); }
  ctx.restore();
};

/* =========================
   2) CHEVRON BANNER (EXPERIENCES)
   ========================= */
type BannerOpts = {
  fill?: string; outline?: string | null; outlineWidth?: number;
  text?: string; font?: string; textColor?: string;
  notch?: number;         // chevron depth
  rotationRad?: number;
};
export const createBanner = (
  x: number, y: number, w: number, h: number,
  opts: BannerOpts = {}, isStatic = false, shapeData?: ShapeStore
) => {
  const body = Bodies.rectangle(x, y, w, h, common(isStatic));
  shapeData?.set(body, {
    type: "banner", w, h,
    ...{ fill: "#F59E0B", outline: null, outlineWidth: 2, text: "EXPERIENCES", font: "800 32px Inter", textColor: getDarkerTextColor("#F59E0B"), notch: Math.min(28, h / 2 - 4), rotationRad: 0 },
    ...opts
  });
  return body;
};

export const renderBanner = (ctx: CanvasRenderingContext2D, body: Body, shapeData: ShapeStore) => {
  const d = shapeData.get(body);
  if (!d || d.type !== "banner") return;
  const { x, y } = body.position;
  const { w, h, notch, fill, outline, outlineWidth, text, font, textColor, rotationRad } = d;
  const nx = Math.max(0, Math.min(notch, h * 0.49));
  ctx.save();
  ctx.translate(x, y); ctx.rotate(body.angle + rotationRad);
  ctx.beginPath();
  // left chevron
  ctx.moveTo(-w/2, 0);
  ctx.lineTo(-w/2 + nx, -h/2);
  ctx.lineTo(w/2 - nx, -h/2);
  // right chevron
  ctx.lineTo(w/2, 0);
  ctx.lineTo(w/2 - nx, h/2);
  ctx.lineTo(-w/2 + nx, h/2);
  ctx.closePath();
  ctx.fillStyle = fill; ctx.fill();
  if (outline) { ctx.lineWidth = outlineWidth; ctx.strokeStyle = outline; ctx.stroke(); }
  if (text) { ctx.fillStyle = textColor; ctx.font = font; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(text, 0, 0); }
  ctx.restore();
};

/* =========================
   3) BURST STAR (GOOD FOOD) – n spikes
   ========================= */
type BurstOpts = {
  fill?: string; outline?: string | null; outlineWidth?: number;
  spikes?: number; innerR?: number; outerR?: number; rotationRad?: number;
  text?: string; font?: string; textColor?: string;
};
export const createBurst = (
  x: number, y: number,
  opts: BurstOpts = {}, isStatic = false, shapeData?: ShapeStore
) => {
  const { outerR = 80 } = opts;
  const body = Bodies.circle(x, y, outerR, common(isStatic));
  shapeData?.set(body, {
    type: "burst",
    ...{ fill: "#22C55E", outline: null, outlineWidth: 2, spikes: 12, innerR: 50, outerR, rotationRad: 0, text: "GOOD\nFOOD", font: "900 24px Inter", textColor: getDarkerTextColor("#22C55E") },
    ...opts
  });
  return body;
};

export const renderBurst = (ctx: CanvasRenderingContext2D, body: Body, shapeData: ShapeStore) => {
  const d = shapeData.get(body);
  if (!d || d.type !== "burst") return;
  const { x, y } = body.position;
  const { spikes, innerR, outerR, rotationRad, fill, outline, outlineWidth, text, font, textColor } = d;
  ctx.save();
  ctx.translate(x, y); ctx.rotate(body.angle + rotationRad);
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const a = (i / (spikes * 2)) * Math.PI * 2;
    const r = i % 2 === 0 ? outerR : innerR;
    const px = Math.cos(a) * r, py = Math.sin(a) * r;
    i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
  }
  ctx.closePath(); ctx.fillStyle = fill; ctx.fill();
  if (outline) { ctx.lineWidth = outlineWidth; ctx.strokeStyle = outline; ctx.stroke(); }
  if (text) {
    ctx.fillStyle = textColor; ctx.font = font; ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const lines = String(text).split("\n");
    const lh = parseInt(font.match(/\d+/)?.[0] || "20", 10) * 1.1;
    // Center text in the burst shape
    lines.forEach((ln: string, i: number) => {
      const y = (i - (lines.length - 1) / 2) * lh;
      ctx.fillText(ln, 0, y);
    });
  }
  ctx.restore();
};

/* =========================
   4) PILL (rounded rectangle, rotatable)
   ========================= */
type PillOpts = {
  fill?: string; outline?: string | null; outlineWidth?: number; radius?: number;
  text?: string; font?: string; textColor?: string; rotationRad?: number;
};
export const createPill = (
  x: number, y: number, w: number, h: number,
  opts: PillOpts = {}, isStatic = false, shapeData?: ShapeStore
) => {
  const body = Bodies.rectangle(x, y, w, h, common(isStatic));
  shapeData?.set(body, {
    type: "pill", w, h,
    ...{ fill: "#F9A8D4", outline: null, outlineWidth: 2, radius: Math.min(h/2, 56), text: "MARKETING", font: "900 28px Inter", textColor: getDarkerTextColor("#F9A8D4"), rotationRad: 0 },
    ...opts
  });
  return body;
};

export const renderPill = (ctx: CanvasRenderingContext2D, body: Body, shapeData: ShapeStore) => {
  const d = shapeData.get(body);
  if (!d || d.type !== "pill") return;
  const { x, y } = body.position;
  const { w, h, radius, fill, outline, outlineWidth, text, font, textColor, rotationRad } = d;
  const r = Math.min(radius, h/2);
  ctx.save();
  ctx.translate(x, y); ctx.rotate(body.angle + rotationRad);
  // rounded rect
  ctx.beginPath();
  ctx.moveTo(-w/2 + r, -h/2);
  ctx.lineTo(w/2 - r, -h/2);
  ctx.arc(w/2 - r, -h/2 + r, r, -Math.PI/2, 0);
  ctx.lineTo(w/2, h/2 - r);
  ctx.arc(w/2 - r, h/2 - r, r, 0, Math.PI/2);
  ctx.lineTo(-w/2 + r, h/2);
  ctx.arc(-w/2 + r, h/2 - r, r, Math.PI/2, Math.PI);
  ctx.lineTo(-w/2, -h/2 + r);
  ctx.arc(-w/2 + r, -h/2 + r, r, Math.PI, 1.5*Math.PI);
  ctx.closePath();
  ctx.fillStyle = fill; ctx.fill();
  if (outline) { ctx.lineWidth = outlineWidth; ctx.strokeStyle = outline; ctx.stroke(); }
  if (text) { ctx.fillStyle = textColor; ctx.font = font; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(text, 0, 0); }
  ctx.restore();
};

/* =========================
   5) PARALLELOGRAM (DETAILS)
   ========================= */
type ParaOpts = {
  fill?: string; outline?: string | null; outlineWidth?: number;
  skew?: number;       // +right
  text?: string; font?: string; textColor?: string; rotationRad?: number;
};
export const createParallelogram = (
  x: number, y: number, w: number, h: number,
  opts: ParaOpts = {}, isStatic = false, shapeData?: ShapeStore
) => {
  const body = Bodies.rectangle(x, y, w, h, common(isStatic));
  shapeData?.set(body, {
    type: "parallelogram", w, h,
    ...{ fill: "#A7F3D0", outline: null, outlineWidth: 2, skew: 0.35, text: "DETAILS", font: "900 28px Inter", textColor: getDarkerTextColor("#A7F3D0"), rotationRad: 0 },
    ...opts
  });
  return body;
};

export const renderParallelogram = (ctx: CanvasRenderingContext2D, body: Body, shapeData: ShapeStore) => {
  const d = shapeData.get(body);
  if (!d || d.type !== "parallelogram") return;
  const { x, y } = body.position;
  const { w, h, skew, fill, outline, outlineWidth, text, font, textColor, rotationRad } = d;
  const dx = Math.tan(skew) * (h/2);
  ctx.save();
  ctx.translate(x, y); ctx.rotate(body.angle + rotationRad);
  ctx.beginPath();
  ctx.moveTo(-w/2 + dx, -h/2);
  ctx.lineTo(w/2 + dx, -h/2);
  ctx.lineTo(w/2 - dx, h/2);
  ctx.lineTo(-w/2 - dx, h/2);
  ctx.closePath();
  ctx.fillStyle = fill; ctx.fill();
  if (outline) { ctx.lineWidth = outlineWidth; ctx.strokeStyle = outline; ctx.stroke(); }
  if (text) { ctx.fillStyle = textColor; ctx.font = font; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(text, 0, 0); }
  ctx.restore();
};

/* =========================
   6) VERTICAL LABEL (rounded rect, vertical text)
   ========================= */
type VLabelOpts = {
  fill?: string; outline?: string | null; outlineWidth?: number; radius?: number;
  text?: string; font?: string; textColor?: string;
};
export const createVLabel = (
  x: number, y: number, w: number, h: number,
  opts: VLabelOpts = {}, isStatic = false, shapeData?: ShapeStore
) => {
  const body = Bodies.rectangle(x, y, w, h, common(isStatic));
  shapeData?.set(body, {
    type: "vlabel", w, h,
    ...{ fill: "#93C5FD", outline: null, outlineWidth: 2, radius: 18, text: "ATMOSPHERE", font: "900 22px Inter", textColor: getDarkerTextColor("#93C5FD") },
    ...opts
  });
  return body;
};

export const renderVLabel = (ctx: CanvasRenderingContext2D, body: Body, shapeData: ShapeStore) => {
  const d = shapeData.get(body);
  if (!d || d.type !== "vlabel") return;
  const { x, y } = body.position;
  const { w, h, radius, fill, outline, outlineWidth, text, font, textColor } = d;
  const r = Math.min(radius, Math.min(w, h)/4);
  ctx.save();
  ctx.translate(x, y);
  // rounded rect
  ctx.beginPath();
  ctx.moveTo(-w/2 + r, -h/2);
  ctx.lineTo(w/2 - r, -h/2);
  ctx.quadraticCurveTo(w/2, -h/2, w/2, -h/2 + r);
  ctx.lineTo(w/2, h/2 - r);
  ctx.quadraticCurveTo(w/2, h/2, w/2 - r, h/2);
  ctx.lineTo(-w/2 + r, h/2);
  ctx.quadraticCurveTo(-w/2, h/2, -w/2, h/2 - r);
  ctx.lineTo(-w/2, -h/2 + r);
  ctx.quadraticCurveTo(-w/2, -h/2, -w/2 + r, -h/2);
  ctx.closePath();
  ctx.fillStyle = fill; ctx.fill();
  if (outline) { ctx.lineWidth = outlineWidth; ctx.strokeStyle = outline; ctx.stroke(); }
  // vertical text
  if (text) { ctx.save(); ctx.rotate(-Math.PI/2); ctx.fillStyle = textColor; ctx.font = font; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(text, 0, 0); ctx.restore(); }
  ctx.restore();
};

/* =========================
   7) QUARTER PIE (PRODUCTION)
   ========================= */
type PieOpts = {
  fill?: string; outline?: string | null; outlineWidth?: number; radius?: number; rotationRad?: number;
  text?: string; font?: string; textColor?: string;
};
export const createQuarterPie = (
  x: number, y: number, radius: number,
  opts: PieOpts = {}, isStatic = false, shapeData?: ShapeStore
) => {
  const body = Bodies.rectangle(x, y, radius*1.2, radius*1.2, common(isStatic));
  shapeData?.set(body, {
    type: "quarterPie", r: radius,
    ...{ fill: "#FACC15", outline: null, outlineWidth: 2, rotationRad: 0, text: "PRODUCTION", font: "900 26px Inter", textColor: getDarkerTextColor("#FACC15") },
    ...opts
  });
  return body;
};

export const renderQuarterPie = (ctx: CanvasRenderingContext2D, body: Body, shapeData: ShapeStore) => {
  const d = shapeData.get(body);
  if (!d || d.type !== "quarterPie") return;
  const { x, y } = body.position;
  const { r, fill, outline, outlineWidth, rotationRad, text, font, textColor } = d;
  ctx.save();
  ctx.translate(x, y); ctx.rotate(body.angle + rotationRad);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.arc(0, 0, r, 0, Math.PI/2); // 90°
  ctx.closePath();
  ctx.fillStyle = fill; ctx.fill();
  if (outline) { ctx.lineWidth = outlineWidth; ctx.strokeStyle = outline; ctx.stroke(); }
  if (text) { 
    ctx.fillStyle = textColor; 
    ctx.font = font; 
    ctx.textAlign = "center"; 
    ctx.textBaseline = "middle"; 
    // Position text in the center of the quarter pie, accounting for rotation
    const textX = r * 0.35;
    const textY = -r * 0.35;
    // Apply additional rotation to keep text readable when shape is rotated
    ctx.rotate(Math.PI/6);
    ctx.fillText(text, textX, textY); 
  }
  ctx.restore();
};

/* =========================
   8) THICK “C” (ring segment)
   ========================= */
type ThickCOpts = {
  fill?: string; outline?: string | null; outlineWidth?: number;
  outerR?: number; innerR?: number; startRad?: number; endRad?: number; rotationRad?: number;
};
export const createThickC = (
  x: number, y: number,
  opts: ThickCOpts = {}, isStatic = false, shapeData?: ShapeStore
) => {
  const { outerR = 170 } = opts;
  const body = Bodies.circle(x, y, outerR, common(isStatic));
  shapeData?.set(body, {
    type: "thickC",
    ...{ fill: "#22D3EE", outline: null, outlineWidth: 2, outerR, innerR: outerR - 70, startRad: -Math.PI*0.28, endRad: Math.PI*1.28, rotationRad: 0 },
    ...opts
  });
  return body;
};

export const renderThickC = (ctx: CanvasRenderingContext2D, body: Body, shapeData: ShapeStore) => {
  const d = shapeData.get(body);
  if (!d || d.type !== "thickC") return;
  const { x, y } = body.position;
  const { outerR, innerR, startRad, endRad, rotationRad, fill, outline, outlineWidth } = d;
  ctx.save();
  ctx.translate(x, y); ctx.rotate(body.angle + rotationRad);
  ctx.beginPath();
  ctx.arc(0, 0, outerR, startRad, endRad);
  ctx.arc(0, 0, innerR, endRad, startRad, true);
  ctx.closePath();
  ctx.fillStyle = fill; ctx.fill();
  if (outline) { ctx.lineWidth = outlineWidth; ctx.strokeStyle = outline; ctx.stroke(); }
  ctx.restore();
};

/* =========================
   9) TEXT COMPONENT (rounded rectangle with text)
   ========================= */
type TextComponentOpts = {
  fill?: string; 
  outline?: string | null; 
  outlineWidth?: number;
  text?: string; 
  font?: string; 
  textColor?: string;
  borderRadius?: number; // if not provided, will be random
  rotationRad?: number;
};
export const createTextComponent = (
  x: number, y: number, w: number, h: number,
  opts: TextComponentOpts = {}, isStatic = false, shapeData?: ShapeStore
) => {
  const body = Bodies.rectangle(x, y, w, h, common(isStatic));
  
  // Generate random border radius if not provided
  const borderRadius = opts.borderRadius ?? Math.random() > 0.5 ? 
    Math.random() * Math.min(w, h) * 0.3 : 0;
  
  shapeData?.set(body, {
    type: "textComponent", w, h, borderRadius,
    ...{ 
      fill: "#FFFFFF", 
      outline: "#000000", 
      outlineWidth: 1, 
      text: "TEXT", 
      font: "700 24px Inter, system-ui, -apple-system, sans-serif", 
      textColor: "#000000",
      rotationRad: 0 
    },
    ...opts
  });
  return body;
};

export const renderTextComponent = (ctx: CanvasRenderingContext2D, body: Body, shapeData: ShapeStore) => {
  const d = shapeData.get(body);
  if (!d || d.type !== "textComponent") return;
  const { x, y } = body.position;
  const { w, h, borderRadius, fill, outline, outlineWidth, text, font, textColor, rotationRad } = d;
  
  ctx.save();
  ctx.translate(x, y); 
  ctx.rotate(body.angle + rotationRad);
  
  // Draw rounded rectangle
  ctx.beginPath();
  if (borderRadius > 0) {
    // Rounded rectangle
    ctx.moveTo(-w/2 + borderRadius, -h/2);
    ctx.lineTo(w/2 - borderRadius, -h/2);
    ctx.quadraticCurveTo(w/2, -h/2, w/2, -h/2 + borderRadius);
    ctx.lineTo(w/2, h/2 - borderRadius);
    ctx.quadraticCurveTo(w/2, h/2, w/2 - borderRadius, h/2);
    ctx.lineTo(-w/2 + borderRadius, h/2);
    ctx.quadraticCurveTo(-w/2, h/2, -w/2, h/2 - borderRadius);
    ctx.lineTo(-w/2, -h/2 + borderRadius);
    ctx.quadraticCurveTo(-w/2, -h/2, -w/2 + borderRadius, -h/2);
  } else {
    // Regular rectangle
    ctx.rect(-w/2, -h/2, w, h);
  }
  ctx.closePath();
  
  // Fill and stroke
  ctx.fillStyle = fill; 
  ctx.fill();
  if (outline) { 
    ctx.lineWidth = outlineWidth; 
    ctx.strokeStyle = outline; 
    ctx.stroke(); 
  }
  
  // Draw text
  if (text) { 
    ctx.fillStyle = textColor; 
    ctx.font = font; 
    ctx.textAlign = "center"; 
    ctx.textBaseline = "middle"; 
    ctx.fillText(text, 0, 0); 
  }
  
  ctx.restore();
};
