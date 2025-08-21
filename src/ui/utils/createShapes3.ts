import { Bodies, Body, Vector } from "matter-js";

/** ---------- BAGEL (elliptical donut with text-on-path) ---------- */
type BagelOpts = {
  fillColor?: string;
  outlineColor?: string | null;
  outlineWidth?: number;
  thickness?: number;              // ring thickness (px)
  rotationRad?: number;            // extra rotation for renderer

  // text on ring
  text?: string;
  font?: string;                   // e.g. "700 42px Inter"
  textColor?: string;
  textSide?: "outer" | "inner";    // flip baseline
  textDirection?: "cw" | "ccw";    // along the ring
  startAngleRad?: number;          // center of the string
  letterSpacing?: number;          // extra px per char
};

export const createBagel = (
  x: number,
  y: number,
  outerRx: number,                 // ellipse radii (outer)
  outerRy: number,
  opts: BagelOpts = {},
  isStatic = false,
  shapeData: Map<Body, any>
) => {
  const {
    fillColor = "#FECACA",
    outlineColor = null,
    outlineWidth = 2,
    thickness = 80,
    rotationRad = 0,

    text = "",
    font = "700 40px Inter",
    textColor = "#0B1220",
    textSide = "outer",
    textDirection = "cw",
    startAngleRad = 0,
    letterSpacing = 0,
  } = opts;

  // physics placeholder (simple circle) — visuals handled in renderer
  const common = { restitution: 0.6, friction: 0.2, isStatic, render: { visible: false } };
  const body = Bodies.circle(x, y, Math.max(outerRx, outerRy), common);

  shapeData.set(body, {
    type: "bagel",
    outerRx,
    outerRy,
    thickness,
    fillColor,
    outlineColor,
    outlineWidth,
    rotationRad,
    text,
    font,
    textColor,
    textSide,
    textDirection,
    startAngleRad,
    letterSpacing,
  });

  return body;
};

export const renderBagel = (
  ctx: CanvasRenderingContext2D,
  body: Body,
  shapeData: Map<Body, any>
) => {
  const d = shapeData.get(body);
  if (!d || d.type !== "bagel") return;

  const {
    outerRx, outerRy, thickness,
    fillColor, outlineColor, outlineWidth, rotationRad,
    text, font, textColor, textSide, textDirection, startAngleRad, letterSpacing,
  } = d as Required<BagelOpts> & { outerRx: number; outerRy: number; thickness: number };

  const innerRx = Math.max(outerRx - thickness, 2);
  const innerRy = Math.max(outerRy - thickness, 2);

  const { x, y } = body.position;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(body.angle + (rotationRad || 0));

  // donut (even-odd fill)
  ctx.beginPath();
  ctx.ellipse(0, 0, outerRx, outerRy, 0, 0, Math.PI * 2);
  ctx.ellipse(0, 0, innerRx, innerRy, 0, 0, Math.PI * 2);
  ctx.fillStyle = fillColor!;
  ctx.fill("evenodd");
  if (outlineColor) {
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = outlineWidth || 2;
    ctx.stroke();
  }

  // text on ellipse (approximate spacing)
  if (text) {
    ctx.save();
    ctx.fillStyle = textColor!;
    ctx.font = font!;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";

    // mid-path radii for glyph centers
    const rx = (outerRx + innerRx) * 0.5;
    const ry = (outerRy + innerRy) * 0.5;

    const chars = [...text];
    const Ravg = (rx + ry) * 0.5; // coarse average radius for spacing
    const totalW = chars.reduce((s, ch) => s + ctx.measureText(ch).width + letterSpacing!, 0);

    const dir = textDirection === "cw" ? 1 : -1;
    let theta = startAngleRad! - dir * (totalW / (2 * Ravg)); // center the string

    for (const ch of chars) {
      const w = ctx.measureText(ch).width + (letterSpacing || 0);
      const dθ = (w / Ravg) * dir;

      theta += dθ * 0.5;

      const px = rx * Math.cos(theta);
      const py = ry * Math.sin(theta);

      // tangent of ellipse at θ
      const phi = Math.atan2(ry * Math.cos(theta), -rx * Math.sin(theta));
      const rot = phi + (textSide === "outer" ? 0 : Math.PI);

      ctx.save();
      ctx.translate(px, py);
      ctx.rotate(rot);
      ctx.fillText(ch, 0, 0);
      ctx.restore();

      theta += dθ * 0.5;
    }

    ctx.restore();
  }

  ctx.restore();
};

/** ---------- RIBBON (rounded rectangle with centered text) ---------- */
type RibbonOpts = {
  fillColor?: string;
  outlineColor?: string | null;
  outlineWidth?: number;
  radius?: number;
  text?: string;
  font?: string;
  textColor?: string;
  rotationRad?: number;
};

export const createRibbon = (
  x: number,
  y: number,
  width: number,
  height: number,
  opts: RibbonOpts = {},
  isStatic = false,
  shapeData?: Map<Body, any>
) => {
  const {
    fillColor = "#F9A8D4",
    outlineColor = null,
    outlineWidth = 2,
    radius = 16,
    text = "",
    font = "700 34px Inter",
    textColor = "#0B1220",
    rotationRad = 0,
  } = opts;

  const common = { restitution: 0.6, friction: 0.2, isStatic, render: { visible: false } };
  const body = Bodies.rectangle(x, y, width, height, common);

  shapeData?.set(body, {
    type: "ribbon",
    w: width,
    h: height,
    radius,
    fillColor,
    outlineColor,
    outlineWidth,
    text,
    font,
    textColor,
    rotationRad,
  });

  return body;
};

export const renderRibbon = (
  ctx: CanvasRenderingContext2D,
  body: Body,
  shapeData: Map<Body, any>
) => {
  const d = shapeData.get(body);
  if (!d || d.type !== "ribbon") return;

  const { w, h, radius, fillColor, outlineColor, outlineWidth, text, font, textColor, rotationRad } = d;
  const { x, y } = body.position;

  const r = Math.min(radius, w / 2, h / 2);

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(body.angle + (rotationRad || 0));

  // rounded rect
  ctx.beginPath();
  ctx.moveTo(-w / 2 + r, -h / 2);
  ctx.lineTo(w / 2 - r, -h / 2);
  ctx.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
  ctx.lineTo(w / 2, h / 2 - r);
  ctx.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
  ctx.lineTo(-w / 2 + r, h / 2);
  ctx.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
  ctx.lineTo(-w / 2, -h / 2 + r);
  ctx.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
  ctx.closePath();

  ctx.fillStyle = fillColor;
  ctx.fill();
  if (outlineColor) {
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = outlineWidth;
    ctx.stroke();
  }

  if (text) {
    ctx.fillStyle = textColor;
    ctx.font = font;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 0, 0);
  }

  ctx.restore();
};
