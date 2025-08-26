import { Bodies, Body, Vector } from "matter-js";

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
    textColor = getDarkerTextColor(fillColor),
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
    textColor = getDarkerTextColor(fillColor),
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
