import { Bodies, Body } from "matter-js";

/** Shared store shape -> metadata */
export type ShapeStore = Map<Body, any>;
const common = (isStatic: boolean) =>
  ({ restitution: 0.4, friction: 0.4, isStatic, render: { visible: false } });

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
    ...{ fill: "#E11D1D", outline: null, outlineWidth: 2, text: "", font: "900 44px Inter", textColor: "#0B1220" },
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
    ...{ fill: "#F59E0B", outline: null, outlineWidth: 2, text: "EXPERIENCES", font: "800 32px Inter", textColor: "#0B1220", notch: Math.min(28, h / 2 - 4), rotationRad: 0 },
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
    ...{ fill: "#22C55E", outline: null, outlineWidth: 2, spikes: 12, innerR: 50, outerR, rotationRad: 0, text: "GOOD\nFOOD", font: "900 24px Inter", textColor: "#0B1220" },
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
    lines.forEach((ln: string, i: number) => ctx.fillText(ln, 0, (i - (lines.length - 1) / 2) * lh));
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
    ...{ fill: "#F9A8D4", outline: null, outlineWidth: 2, radius: Math.min(h/2, 56), text: "MARKETING", font: "900 28px Inter", textColor: "#0B1220", rotationRad: 0 },
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
    ...{ fill: "#A7F3D0", outline: null, outlineWidth: 2, skew: 0.35, text: "DETAILS", font: "900 28px Inter", textColor: "#0B1220", rotationRad: 0 },
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
    ...{ fill: "#93C5FD", outline: null, outlineWidth: 2, radius: 18, text: "ATMOSPHERE", font: "900 22px Inter", textColor: "#0B1220" },
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
    ...{ fill: "#FACC15", outline: null, outlineWidth: 2, rotationRad: 0, text: "PRODUCTION", font: "900 26px Inter", textColor: "#0B1220" },
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
  if (text) { ctx.fillStyle = textColor; ctx.font = font; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic"; ctx.rotate(Math.PI/6); ctx.fillText(text, r*0.25, -r*0.12); }
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
