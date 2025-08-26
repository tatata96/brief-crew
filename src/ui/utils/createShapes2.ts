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

export const createCircle = (x: number, y: number, radius: number, isStatic: boolean = false, shapeData: any, isHalfCircle: boolean = false, color: string) => {
  const body = Bodies.circle(x, y, radius, {
    restitution: 0.6,
    friction: 0.2,
    isStatic,
    render: { visible: false },
  });
  shapeData.set(body, { type: 'circle', color, size: radius, isHalfCircle });
  return body;
};

export const createArch = (x: number, y: number, size: number, color: string, archSide: 'left' | 'right' | 'top' | 'bottom', isStatic: boolean = false, shapeData: any) => {
  const body = Bodies.rectangle(x, y, size, size, {
    restitution: 0.6,
    friction: 0.2,
    isStatic,
    render: { visible: false },
  });
  shapeData.set(body, { type: 'arch', color, size, archSide });
  return body;
};

export const renderArch = (ctx: CanvasRenderingContext2D, arch: Body, shapeData: any) => {
  const data = shapeData.get(arch);
  if (data?.type === 'arch') {
    const { color, size, archSide } = data;
    const archPos = arch.position;
    
    ctx.save();
    ctx.translate(archPos.x, archPos.y);
    ctx.rotate(arch.angle);
    
    // Draw the main square
    ctx.fillStyle = color;
    ctx.fillRect(-size/2, -size/2, size, size);
    
    // Cut out the arch based on the side
    ctx.globalCompositeOperation = 'destination-out';
    ctx.fillStyle = 'rgba(0,0,0,1)';
    ctx.beginPath();
    
    switch (archSide) {
      case 'bottom':
        // Arch at bottom center, open at bottom
        ctx.arc(0, size/2, size/3, 0, Math.PI, true);
        break;
      case 'top':
        // Arch at top center, open at top
        ctx.arc(0, -size/2, size/3, 0, Math.PI, false);
        break;
      case 'left':
        // Arch at left center, open at left
        ctx.arc(-size/2, 0, size/3, -Math.PI/2, Math.PI/2, true);
        break;
      case 'right':
        // Arch at right center, open at right
        ctx.arc(size/2, 0, size/3, Math.PI/2, -Math.PI/2, true);
        break;
    }
    
    ctx.fill();
    ctx.restore();
  }
};

export const createRectangleWithInnerCircles = (
  x: number,
  y: number,
  width: number,
  height: number,
  circleCount: number = 1,
  padding: number = 8,
  rectColor: string,
  circleColors: string | string[],
  align: "top" | "center" | "bottom" = "center",
  isStatic: boolean = false,
  shapeData: any
) => {
  const body = Bodies.rectangle(x, y, width, height, {
    restitution: 0.6,
    friction: 0.2,
    isStatic,
    render: { visible: false },
  });

  shapeData.set(body, {
    type: "rectWithCircles",
    width,
    height,
    circleCount: Math.max(0, Math.floor(circleCount)),
    padding: Math.max(0, padding),
    rectColor,
    circleColors,
    align,
  });

  return body;
};

/**
 * Custom renderer for rectangles with inner circles.
 * Draws one horizontal row. If circleCount === 1 it centers horizontally.
 */
export const renderRectangleWithInnerCircles = (
  ctx: CanvasRenderingContext2D,
  rectBody: Body,
  shapeData: any
) => {
  const data = shapeData.get(rectBody);
  if (!data || data.type !== "rectWithCircles") return;

  const {
    width,
    height,
    circleCount,
    padding,
    rectColor,
    circleColors,
    align,
  } = data as {
    width: number;
    height: number;
    circleCount: number;
    padding: number;
    rectColor: string;
    circleColors: string | string[];
    align: "top" | "center" | "bottom";
  };

  const pos = rectBody.position;

  ctx.save();
  ctx.translate(pos.x, pos.y);
  ctx.rotate(rectBody.angle);

  // 1) Draw the base rectangle
  ctx.fillStyle = rectColor;
  ctx.fillRect(-width / 2, -height / 2, width, height);

  if (circleCount > 0) {
    // 2) Compute a radius that fits horizontally & vertically with the given padding
    const availableW = Math.max(0, width - 2 * padding - (circleCount - 1) * padding);
    const maxRFromWidth = availableW / (2 * circleCount);
    const maxRFromHeight = Math.max(0, (height - 2 * padding) / 2);
    const r = Math.max(0.5, Math.min(maxRFromWidth, maxRFromHeight));

    // Y position by alignment
    let cy =
      align === "top"
        ? -height / 2 + padding + r
        : align === "bottom"
        ? height / 2 - padding - r
        : 0; // center

    // X start (single circle centers at 0)
    const startX =
      circleCount === 1 ? 0 : -width / 2 + padding + r;

    // Normalize colors array
    const colorsArr =
      Array.isArray(circleColors)
        ? circleColors
        : new Array(circleCount).fill(circleColors);

    // 3) Draw circles
    for (let i = 0; i < circleCount; i++) {
      const cx = circleCount === 1 ? 0 : startX + i * (2 * r + padding);
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fillStyle = colorsArr[i % colorsArr.length];
      ctx.fill();
    }
  }

  ctx.restore();
};

/**
 * Create a concave star body (uses fromVertices).
 * edges  = number of star points (≥3)
 * outerR = outer radius
 * innerR = inner radius (defaults to 45% of outer)
 */
export const createStar = (
  x: number,
  y: number,
  edges: number,
  outerR: number,
  innerR: number = outerR * 0.45,
  color: string,
  isStatic: boolean = false,
  shapeData: any
) => {
  const pts = starPoints(edges, outerR, innerR, 0);

  // Bodies.fromVertices handles concave shapes (needs poly-decomp for best results)
  const body = Bodies.fromVertices(
    x,
    y,
    [pts],
    {
      restitution: 0.6,
      friction: 0.2,
      isStatic,
      render: { visible: false },
    },
    true
  );

  // Fallback: if fromVertices failed (e.g., no decomp), create a circle so it still works
  const finalBody = body ?? Bodies.circle(x, y, outerR * 0.9, {
    restitution: 0.6,
    friction: 0.2,
    isStatic,
    render: { visible: false },
  });

  shapeData.set(finalBody, {
    type: "star",
    color,
    edges: Math.max(3, Math.floor(edges)),
    outerR,
    innerR,
  });

  return finalBody;
};

/** Canvas renderer for the star */
export const renderStar = (
  ctx: CanvasRenderingContext2D,
  body: Body,
  shapeData: any
) => {
  const data = shapeData.get(body);
  if (!data || data.type !== "star") return;

  const { color, edges, outerR, innerR } = data;
  const { x, y } = body.position;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(body.angle);

  const pts = starPoints(edges, outerR, innerR, 0);

  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
  ctx.closePath();

  ctx.fillStyle = color;
  ctx.fill();
  ctx.restore();
};

/** Helper: generate alternating outer/inner vertices around origin */
function starPoints(
  edges: number,
  outerR: number,
  innerR: number,
  rotation: number = 0
) {
  const points: { x: number; y: number }[] = [];
  const n = Math.max(3, Math.floor(edges));
  const step = Math.PI / n; // half step because we alternate inner/outer
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const a = rotation + i * step;
    points.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
  }
  return points;
}

/**
 * Eye with almond outer shape, iris & pupil.
 * - open: 0..1 (blink amount; 1 = fully open)
 * - gazeX/Y: -1..1 (look left/right & up/down)
 * - irisRatio: iris radius vs min(width,height)
 * - pupilRatio: pupil radius vs iris radius
 */
export const createEye = (
  x: number,
  y: number,
  width: number,
  height: number,
  scleraColor: string,
  irisColor: string,
  pupilColor: string,
  open: number = 1,
  gazeX: number = 0,
  gazeY: number = 0,
  irisRatio: number = 0.36,
  pupilRatio: number = 0.45,
  outlineColor: string | null = null,
  outlineWidth: number = 2,
  isStatic: boolean = false,
  shapeData: any
) => {
  const body = Bodies.rectangle(x, y, width, height, {
    restitution: 0.6,
    friction: 0.2,
    isStatic,
    render: { visible: false },
  });

  shapeData.set(body, {
    type: "eye",
    width,
    height,
    scleraColor,
    irisColor,
    pupilColor,
    open: Math.max(0, Math.min(1, open)),
    gazeX: Math.max(-1, Math.min(1, gazeX)),
    gazeY: Math.max(-1, Math.min(1, gazeY)),
    irisRatio,
    pupilRatio,
    outlineColor,
    outlineWidth,
  });

  return body;
};

export const renderEye = (
  ctx: CanvasRenderingContext2D,
  body: Body,
  shapeData: any
) => {
  const data = shapeData.get(body);
  if (!data || data.type !== "eye") return;

  const {
    width: w,
    height: H,
    scleraColor,
    irisColor,
    pupilColor,
    open,
    gazeX,
    gazeY,
    irisRatio,
    pupilRatio,
    outlineColor,
    outlineWidth,
  } = data;

  const { x, y } = body.position;

  // Effective height (blink)
  const h = Math.max(1, H * Math.max(0.02, open)); // never fully 0 to keep a hairline

  // Geometry helpers
  const minWH = Math.min(w, h);
  const irisR = minWH * Math.max(0.05, irisRatio);
  const pupilR = irisR * Math.max(0.1, Math.min(0.95, pupilRatio));

  // Constrain gaze so iris stays inside the eye
  const xLimit = (w / 2) - (irisR + 4);
  const yLimit = (h / 2) - (irisR + 4);
  const ix = Math.max(-xLimit, Math.min(xLimit, gazeX * xLimit * 0.8));
  const iy = Math.max(-yLimit, Math.min(yLimit, gazeY * yLimit * 0.8));

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(body.angle);

  // ---- Outer almond (sclera) ----
  ctx.beginPath();
  ctx.moveTo(-w / 2, 0);
  ctx.quadraticCurveTo(0, -h / 2, w / 2, 0);  // top lid
  ctx.quadraticCurveTo(0, h / 2, -w / 2, 0);  // bottom lid
  ctx.closePath();
  ctx.fillStyle = scleraColor;
  ctx.fill();

  if (outlineColor) {
    ctx.lineWidth = outlineWidth;
    ctx.strokeStyle = outlineColor;
    ctx.stroke();
  }

  // Clip iris/pupil to eye shape so they don't bleed outside when blinking
  ctx.save();
  ctx.clip();

  // ---- Iris ----
  ctx.beginPath();
  ctx.arc(ix, iy, irisR, 0, Math.PI * 2);
  ctx.fillStyle = irisColor;
  ctx.fill();

  // ---- Pupil ----
  ctx.beginPath();
  ctx.arc(ix, iy, pupilR, 0, Math.PI * 2);
  ctx.fillStyle = pupilColor;
  ctx.fill();

  // ---- Small highlight ----
  ctx.beginPath();
  ctx.arc(ix - pupilR * 0.4, iy - pupilR * 0.4, Math.max(1, pupilR * 0.25), 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.85)";
  ctx.fill();

  ctx.restore(); // end clip
  ctx.restore();
};

/**
 * Create a martini glass (inverted triangle bowl, straight stem, flat base).
 *
 * @param x,y        world position (center of the whole glass)
 * @param size       overall height of the glass (rim → bottom of base)
 * @param options    colors & (optional) outline
 * @param isStatic   Matter flag
 * @param shapeData  your Map<Body,Meta>
 */
export const createMartiniGlass = (
  x: number,
  y: number,
  size: number,
  options: {
    bowlColor?: string;       // fill for the bowl / drink
    stemColor?: string;       // fill for the stem
    baseColor?: string;       // fill for the base
    outlineColor?: string | null; // stroke around the silhouette (null = none)
    outlineWidth?: number;
  } = {},
  isStatic: boolean = false,
  shapeData: any
) => {
  // Default look (inspired by the invite): solid orange glass
  const bowlColor   = options.bowlColor   ?? "#6366F1";
  const stemColor   = options.stemColor   ?? bowlColor;
  const baseColor   = options.baseColor   ?? bowlColor;
  const outlineColor = options.outlineColor ?? null;
  const outlineWidth = options.outlineWidth ?? 2;

  // Geometry ratios (tuned to look like a classic martini silhouette)
  const totalH    = size;
  const bowlH     = totalH * 0.46;
  const bowlW     = totalH * 0.92;
  const stemH     = totalH * 0.40;
  const stemW     = Math.max(4, bowlW * 0.08);
  const baseH     = totalH * 0.08;
  const baseW     = bowlW * 0.48;

  // Top of bowl (rim) in world coords so parts stack neatly
  const yTop = y - (bowlH + stemH + baseH) / 2;

  const common = {
    restitution: 0.6,
    friction: 0.2,
    isStatic,
    render: { visible: false },
  };

  // --- Bowl: an inverted isosceles triangle (convex → fine without decomp) ---
  // Local triangle points (base at y=0, apex at y=bowlH). Centroid is at y=bowlH/3.
  const triVerts = [
    { x: -bowlW / 2, y: 0 },
    { x:  bowlW / 2, y: 0 },
    { x:  0,         y: bowlH },
  ];
  const bowl = Bodies.fromVertices(
    x,
    yTop + bowlH / 3, // place the centroid so the rim sits exactly at yTop
    [triVerts],
    common,
    true
  ) as Body;

  // --- Stem: a thin rectangle under the triangle's apex ---
  const stem = Bodies.rectangle(
    x,
    yTop + bowlH + stemH / 2,
    stemW,
    stemH,
    common
  );

  // --- Base: a flat rectangle at the bottom ---
  const base = Bodies.rectangle(
    x,
    yTop + bowlH + stemH + baseH / 2,
    baseW,
    baseH,
    common
  );

  // Combine into one compound body
  const glass = Body.create({
    parts: [bowl, stem, base],
    ...common,
  });

  // Ensure final position is exactly (x, y)
  Body.setPosition(glass, Vector.create(x, y));

  // Store render metadata only on the compound
  shapeData.set(glass, {
    type: "martiniGlass",
    size: totalH,
    bowlW,
    bowlH,
    stemW,
    stemH,
    baseW,
    baseH,
    colors: { bowlColor, stemColor, baseColor, outlineColor, outlineWidth },
  });

  return glass;
};

/**
 * Canvas renderer for the martini glass created above.
 * Draws a filled bowl, stem, and base. No lemon/olive is added.
 */
export const renderMartiniGlass = (
  ctx: CanvasRenderingContext2D,
  body: Body,
  shapeData: any
) => {
  const data = shapeData.get(body);
  if (!data || data.type !== "martiniGlass") return;

  const {
    size,
    bowlW, bowlH,
    stemW, stemH,
    baseW, baseH,
    colors: { bowlColor, stemColor, baseColor, outlineColor, outlineWidth },
  } = data;

  const { x, y } = body.position;
  const totalH = bowlH + stemH + baseH;
  const topY = -totalH / 2; // relative to the body's center

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(body.angle);

  // --- Bowl (inverted triangle) ---
  ctx.beginPath();
  ctx.moveTo(-bowlW / 2, topY);           // left rim
  ctx.lineTo( bowlW / 2, topY);           // right rim
  ctx.lineTo( 0,          topY + bowlH);  // apex
  ctx.closePath();
  ctx.fillStyle = bowlColor;
  ctx.fill();
  if (outlineColor) {
    ctx.lineWidth = outlineWidth;
    ctx.strokeStyle = outlineColor;
    ctx.stroke();
  }

  // --- Stem ---
  ctx.fillStyle = stemColor;
  ctx.fillRect(-stemW / 2, topY + bowlH, stemW, stemH);
  if (outlineColor) {
    ctx.lineWidth = outlineWidth;
    ctx.strokeStyle = outlineColor;
    ctx.strokeRect(-stemW / 2, topY + bowlH, stemW, stemH);
  }

  // --- Base ---
  ctx.fillStyle = baseColor;
  ctx.fillRect(-baseW / 2, topY + bowlH + stemH, baseW, baseH);
  if (outlineColor) {
    ctx.lineWidth = outlineWidth;
    ctx.strokeStyle = outlineColor;
    ctx.strokeRect(-baseW / 2, topY + bowlH + stemH, baseW, baseH);
  }

  ctx.restore();
};

type OliveStickOpts = {
  count?: number;              // number of olives
  oliveR?: number;             // olive radius
  spacing?: number | null;     // center-to-center distance; default = oliveR * 1.35 (slight overlap)
  stickThickness?: number;     // skewer thickness
  stickMargin?: number;        // extra rod beyond first/last olive (before tip/ball)
  tipLength?: number;          // triangular point length (render-only)
  tipWidth?: number;           // triangular point width (render-only)
  ballR?: number;              // round end radius
  angleRad?: number;           // orientation angle

  oliveColor?: string;
  pimentoColor?: string;
  rodColor?: string;
  ballColor?: string;
  outlineColor?: string | null;
  outlineWidth?: number;
  pimentoSide?: "left" | "right"; // which side of each olive shows the pimento
};

/** Create a skewer with olives; returns a compound body. */
export const createOliveStick = (
  x: number,
  y: number,
  opts: OliveStickOpts = {},
  isStatic: boolean = false,
  shapeData: any
) => {
  const {
    count = 3,
    oliveR = 20,
    spacing = null,
    stickThickness = Math.max(4, Math.round(oliveR * 0.28)),
    stickMargin = Math.round(oliveR * 0.9),
    tipLength = Math.round(oliveR * 0.9),
    tipWidth = Math.max(stickThickness * 1.6, 6),
    ballR = Math.round(oliveR * 0.35),
    angleRad = 0,

    oliveColor = "#10B981",
    pimentoColor = "#EF4444",
    rodColor = "#6B7280",
    ballColor = "#6B7280",
    outlineColor = null,
    outlineWidth = 1.5,
    pimentoSide = "right",
  } = opts;

  const d = spacing ?? oliveR * 1.35; // overlap a bit
  const span = (count - 1) * d;
  const rodLen = span + 2 * stickMargin; // rectangle part only

  // centers of olives along local X axis
  const centers: number[] = Array.from({ length: count }, (_, i) => -span / 2 + i * d);

  const common = { restitution: 0.6, friction: 0.2, isStatic, render: { visible: false } };

  // rod (rectangle), centered
  const rod = Bodies.rectangle(x, y, rodLen, stickThickness, common);

  // round ball end at right
  const ball = Bodies.circle(x + rodLen / 2 + ballR, y, ballR, common);

  // olives (circles)
  const oliveBodies = centers.map(cx => Bodies.circle(x + cx, y, oliveR, common));

  // Combine
  const oliveStick = Body.create({ parts: [rod, ball, ...oliveBodies], ...common });

  // normalize position/angle
  Body.setPosition(oliveStick, Vector.create(x, y));
  Body.setAngle(oliveStick, angleRad);

  // store render metadata on the compound body
  shapeData.set(oliveStick, {
    type: "oliveStick",
    centers,
    dims: {
      rodLen, stickThickness, ballR, oliveR, tipLength, tipWidth,
    },
    colors: { oliveColor, pimentoColor, rodColor, ballColor, outlineColor, outlineWidth },
    pimentoSide,
  });

  return oliveStick;
};

/** Renderer for createOliveStick */
export const renderOliveStick = (
  ctx: CanvasRenderingContext2D,
  body: Body,
  shapeData: any
) => {
  const data = shapeData.get(body);
  if (!data || data.type !== "oliveStick") return;

  const { centers, dims, colors, pimentoSide } = data as {
    centers: number[];
    dims: { rodLen: number; stickThickness: number; ballR: number; oliveR: number; tipLength: number; tipWidth: number; };
    colors: { oliveColor: string; pimentoColor: string; rodColor: string; ballColor: string; outlineColor: string | null; outlineWidth: number; };
    pimentoSide: "left" | "right";
  };

  const { x, y, angle } = body.position ? { x: body.position.x, y: body.position.y, angle: body.angle } : { x: 0, y: 0, angle: 0 };
  const { rodLen, stickThickness, ballR, oliveR, tipLength, tipWidth } = dims;
  const { oliveColor, pimentoColor, rodColor, ballColor, outlineColor, outlineWidth } = colors;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  // --- Rod ---
  ctx.fillStyle = rodColor;
  ctx.fillRect(-rodLen / 2, -stickThickness / 2, rodLen, stickThickness);

  // Triangular tip (render-only) at left end
  ctx.beginPath();
  ctx.moveTo(-rodLen / 2 - tipLength, 0);                // apex
  ctx.lineTo(-rodLen / 2, -tipWidth / 2);
  ctx.lineTo(-rodLen / 2,  tipWidth / 2);
  ctx.closePath();
  ctx.fillStyle = rodColor;
  ctx.fill();

  // Round ball at right end
  ctx.beginPath();
  ctx.arc(rodLen / 2 + ballR, 0, ballR, 0, Math.PI * 2);
  ctx.fillStyle = ballColor;
  ctx.fill();

  // Optional outlines for hardware
  if (outlineColor) {
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = outlineWidth;
    ctx.strokeRect(-rodLen / 2, -stickThickness / 2, rodLen, stickThickness);
    ctx.beginPath();
    ctx.moveTo(-rodLen / 2 - tipLength, 0);
    ctx.lineTo(-rodLen / 2, -tipWidth / 2);
    ctx.lineTo(-rodLen / 2,  tipWidth / 2);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(rodLen / 2 + ballR, 0, ballR, 0, Math.PI * 2);
    ctx.stroke();
  }

  // --- Olives ---
  const dotR = Math.max(2, oliveR * 0.22);
  const dotDX = (pimentoSide === "right" ? 1 : -1) * oliveR * 0.55;

  centers.forEach(cx => {
    // olive
    ctx.beginPath();
    ctx.arc(cx, 0, oliveR, 0, Math.PI * 2);
    ctx.fillStyle = oliveColor;
    ctx.fill();

    // subtle highlight
    ctx.beginPath();
    ctx.arc(cx - oliveR * 0.35, -oliveR * 0.25, Math.max(1, oliveR * 0.18), 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.55)";
    ctx.fill();

    // pimento
    ctx.beginPath();
    ctx.arc(cx + dotDX, 0, dotR, 0, Math.PI * 2);
    ctx.fillStyle = pimentoColor;
    ctx.fill();
  });

  ctx.restore();
};

type CameraFrontOpts = {
  bodyColor?: string;        // main body
  bodySecondary?: string;    // side panels
  topColor?: string;         // pentaprism/top
  trimColor?: string;        // thin bars
  outlineColor?: string | null;
  outlineWidth?: number;

  lensRingColors?: string[]; // outer→inner rings
  glassOuter?: string;       // lens glass outer
  glassInner?: string;       // lens glass inner
  labelText?: string;        // e.g., "FT"
};

/** Create a front-view camera */
export const createCameraFront = (
  x: number,
  y: number,
  width: number,
  height: number,
  opts: CameraFrontOpts = {},
  isStatic: boolean = false,
  shapeData: any
) => {
  const {
    bodyColor = "#EF4444",
    bodySecondary = "#06B6D4",
    topColor = "#06B6D4",
    trimColor = "red",
    outlineColor = "white",
    outlineWidth = 2,
    lensRingColors = ["#F3F4F6", "#6B7280", "#1F2937", "#1F2937"],
    glassOuter = "#06B6D4",
    glassInner = "#1F2937",
    labelText = "FT",
  } = opts;

  const common = { restitution: 0.6, friction: 0.2, isStatic, render: { visible: false } };

  // Basic geometry (proportional)
  const w = width;
  const h = height;
  const lensR = Math.min(h * 0.42, w * 0.33);

  // Physics: simple parts (rect body + lens circle)
  const bodyRect = Bodies.rectangle(x, y, w, h, common);
  const lens = Bodies.circle(x + w * 0.18, y, lensR * 0.85, common); // slight protrusion

  const camera = Body.create({ parts: [bodyRect, lens], ...common });
  Body.setPosition(camera, Vector.create(x, y));

  // Store render metadata on the compound
  shapeData.set(camera, {
    type: "cameraFront",
    w,
    h,
    lensR,
    colors: {
      bodyColor, bodySecondary, topColor, trimColor,
      outlineColor, outlineWidth, lensRingColors, glassOuter, glassInner,
    },
    labelText,
  });

  return camera;
};

/** Renderer */
export const renderCameraFront = (
  ctx: CanvasRenderingContext2D,
  body: Body,
  shapeData: any
) => {
  const data = shapeData.get(body);
  if (!data || data.type !== "cameraFront") return;

  const { w, h, lensR, colors, labelText } = data as any;
  const {
    bodyColor, bodySecondary, topColor, trimColor,
    outlineColor, outlineWidth, lensRingColors,
    glassOuter, glassInner,
  } = colors;

  const { x, y } = body.position;

  // helpers
  const rr = (rx: number, ry: number, rw: number, rh: number, r: number) => {
    const rad = Math.min(r, rw / 2, rh / 2);
    ctx.beginPath();
    ctx.moveTo(rx + rad, ry);
    ctx.lineTo(rx + rw - rad, ry);
    ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + rad);
    ctx.lineTo(rx + rw, ry + rh - rad);
    ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - rad, ry + rh);
    ctx.lineTo(rx + rad, ry + rh);
    ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - rad);
    ctx.lineTo(rx, ry + rad);
    ctx.quadraticCurveTo(rx, ry, rx + rad, ry);
    ctx.closePath();
  };

  const drawRing = (cx: number, cy: number, rOuter: number, rInner: number, fill: string) => {
    ctx.beginPath();
    ctx.arc(cx, cy, rOuter, 0, Math.PI * 2);
    ctx.arc(cx, cy, rInner, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  };

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(body.angle);

  // ---- Main body ----
  const bodyW = w;
  const bodyH = h;
  rr(-bodyW / 2, -bodyH / 2, bodyW, bodyH, Math.min(w, h) * 0.06);
  ctx.fillStyle = bodyColor;
  ctx.fill();

  // Side panels (secondary color)
  const sideW = bodyW * 0.18;
  rr(-bodyW / 2, -bodyH / 2, sideW, bodyH, 10);
  ctx.fillStyle = bodySecondary; ctx.fill();
  rr(bodyW / 2 - sideW, -bodyH / 2, sideW, bodyH, 10);
  ctx.fill();

  // Thin trims
  ctx.fillStyle = trimColor;
  ctx.fillRect(-bodyW / 2, -bodyH / 2 + bodyH * 0.14, bodyW, Math.max(2, bodyH * 0.02));
  ctx.fillRect(-bodyW / 2,  bodyH / 2 - bodyH * 0.12, bodyW, Math.max(2, bodyH * 0.02));

  // ---- Top pentaprism (trapezoid) ----
  const topH = bodyH * 0.28;
  const topW = bodyW * 0.58;
  ctx.beginPath();
  ctx.moveTo(-topW / 2, -bodyH / 2);
  ctx.lineTo( topW / 2,  -bodyH / 2);
  ctx.lineTo( topW * 0.38, -bodyH / 2 - topH);
  ctx.lineTo(-topW * 0.38, -bodyH / 2 - topH);
  ctx.closePath();
  ctx.fillStyle = topColor; ctx.fill();

  // Small hot shoe block
  rr(-topW * 0.12, -bodyH / 2 - topH, topW * 0.24, topH * 0.22, 4);
  ctx.fillStyle = trimColor; ctx.fill();

  // ---- Lens (center-right) ----
  const cx = bodyW * 0.18; // shift right a bit for style
  const cy = 0;

  // Rings
  const ringCount = Math.max(3, lensRingColors.length);
  const ringStep = lensR / (ringCount + 1);
  for (let i = 0; i < ringCount; i++) {
    const ro = lensR - i * ringStep;
    const ri = ro - Math.max(4, ringStep * 0.55);
    drawRing(cx, cy, ro, ri, lensRingColors[i % lensRingColors.length]);
  }

  // Glass gradient
  const grad = ctx.createRadialGradient(cx - lensR * 0.25, cy - lensR * 0.25, lensR * 0.1, cx, cy, lensR * 0.7);
  grad.addColorStop(0, glassInner);
  grad.addColorStop(1, glassOuter);
  ctx.beginPath();
  ctx.arc(cx, cy, lensR * 0.72, 0, Math.PI * 2);
  ctx.fillStyle = grad; ctx.fill();

  // Small inner highlight
  ctx.beginPath();
  ctx.arc(cx - lensR * 0.22, cy - lensR * 0.22, lensR * 0.12, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,0.65)"; ctx.fill();

  // ---- Details (buttons/lugs) ----
  // Shutter button (top right)
  rr(bodyW * 0.31, -bodyH / 2 - topH * 0.28, bodyW * 0.06, bodyH * 0.08, 4);
  ctx.fillStyle = bodySecondary; ctx.fill();

  // Strap lugs
  ctx.beginPath();
  ctx.arc(-bodyW / 2 + 8, -bodyH * 0.06, 6, 0, Math.PI * 2);
  ctx.arc(bodyW / 2 - 8, -bodyH * 0.06, 6, 0, Math.PI * 2);
  ctx.fillStyle = trimColor; ctx.fill();

  // Label
  ctx.fillStyle = "#F6E9D5";
  ctx.font = `${Math.max(10, bodyH * 0.16)}px sans-serif`;
  ctx.textAlign = "left"; ctx.textBaseline = "middle";
  ctx.fillText(labelText, -bodyW * 0.33, -bodyH * 0.05);

  // Outline
  if (outlineColor) {
    ctx.lineWidth = outlineWidth;
    ctx.strokeStyle = outlineColor;
    rr(-bodyW / 2, -bodyH / 2, bodyW, bodyH, Math.min(w, h) * 0.06);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-topW / 2, -bodyH / 2);
    ctx.lineTo( topW / 2,  -bodyH / 2);
    ctx.lineTo( topW * 0.38, -bodyH / 2 - topH);
    ctx.lineTo(-topW * 0.38, -bodyH / 2 - topH);
    ctx.closePath();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy, lensR, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
};

type ExclaimOpts = {
  color?: string;            // fill for bar & dot
  dotColor?: string | null;  // if null, uses color
  outlineColor?: string | null;
  outlineWidth?: number;

  barWidthRatio?: number;    // % of total height (default 0.18)
  dotRadiusRatio?: number;   // % of total height (default 0.12)
  gapRatio?: number;         // gap between bar and dot (default 0.08)
  cornerRadiusRatio?: number;// rounded bar corners (default 0.35 of bar width)
  angleRad?: number;         // tilt the mark
};

/** Create an exclamation mark as a compound body. */
export const createExclamationMark = (
  x: number,
  y: number,
  totalHeight: number,
  opts: ExclaimOpts = {},
  isStatic: boolean = false,
  shapeData: any
) => {
  const {
    color = "#FF3B2F",
    dotColor = null,
    outlineColor = null,
    outlineWidth = 2,
    barWidthRatio = 0.18,
    dotRadiusRatio = 0.12,
    gapRatio = 0.08,
    cornerRadiusRatio = 0.35,
    angleRad = 0,
  } = opts;

  const H = Math.max(12, totalHeight);
  const barW = Math.max(2, H * barWidthRatio);
  const dotR = Math.max(2, H * dotRadiusRatio);
  const gap  = Math.max(1, H * gapRatio);

  // Bar height takes the remaining space
  const barH = Math.max(4, H - (gap + 2 * dotR));

  // Local coordinates (relative to compound center)
  const topY = -H / 2;
  const barCY = topY + barH / 2;
  const dotCY = H / 2 - dotR;

  const common = { restitution: 0.6, friction: 0.2, isStatic, render: { visible: false } };

  // Physics parts
  const bar = Bodies.rectangle(x, y + barCY, barW, barH, common);
  const dot = Bodies.circle(x, y + dotCY, dotR, common);

  // Combine into compound
  const exclaim = Body.create({ parts: [bar, dot], ...common });
  Body.setPosition(exclaim, Vector.create(x, y));
  Body.setAngle(exclaim, angleRad);

  // Store render data on the compound
  shapeData.set(exclaim, {
    type: "exclamationMark",
    H, barW, barH, barCY, dotR, dotCY,
    cornerRadius: Math.min(barW * cornerRadiusRatio, barW / 2, barH / 2),
    colors: { color, dotColor: dotColor ?? color, outlineColor, outlineWidth },
  });

  return exclaim;
};

/** Canvas renderer for the exclamation mark. */
export const renderExclamationMark = (
  ctx: CanvasRenderingContext2D,
  body: Body,
  shapeData: any
) => {
  const data = shapeData.get(body);
  if (!data || data.type !== "exclamationMark") return;

  const { H, barW, barH, barCY, dotR, dotCY, cornerRadius, colors } = data as any;
  const { color, dotColor, outlineColor, outlineWidth } = colors;

  const { x, y } = body.position;

  // helper: rounded rect centered at (cx,cy)
  const roundRect = (cx: number, cy: number, w: number, h: number, r: number) => {
    const x0 = cx - w / 2, y0 = cy - h / 2;
    const rad = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x0 + rad, y0);
    ctx.lineTo(x0 + w - rad, y0);
    ctx.quadraticCurveTo(x0 + w, y0, x0 + w, y0 + rad);
    ctx.lineTo(x0 + w, y0 + h - rad);
    ctx.quadraticCurveTo(x0 + w, y0 + h, x0 + w - rad, y0 + h);
    ctx.lineTo(x0 + rad, y0 + h);
    ctx.quadraticCurveTo(x0, y0 + h, x0, y0 + h - rad);
    ctx.lineTo(x0, y0 + rad);
    ctx.quadraticCurveTo(x0, y0, x0 + rad, y0);
    ctx.closePath();
  };

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(body.angle);

  // Bar
  roundRect(0, barCY, barW, barH, cornerRadius);
  ctx.fillStyle = color;
  ctx.fill();
  if (outlineColor) { ctx.strokeStyle = outlineColor; ctx.lineWidth = outlineWidth; ctx.stroke(); }

  // Dot
  ctx.beginPath();
  ctx.arc(0, dotCY, dotR, 0, Math.PI * 2);
  ctx.fillStyle = dotColor;
  ctx.fill();
  if (outlineColor) { ctx.beginPath(); ctx.arc(0, dotCY, dotR, 0, Math.PI * 2); ctx.strokeStyle = outlineColor; ctx.lineWidth = outlineWidth; ctx.stroke(); }

  ctx.restore();
};

type SparkStarOpts = {
  color?: string;
  outlineColor?: string | null;
  outlineWidth?: number;

  /** 0..1: radius of the “valley” vs outer tip (smaller = sharper pinch) */
  innerRatio?: number;       // default 0.22
  /** 0..1: how much control points lerp toward inner vs outer (curve tightness) */
  curveMix?: number;         // default 0.55
  /** radians: how far control points are offset from anchors (≈ 10–25° works) */
  curveAngle?: number;       // default Math.PI / 9
  /** samples per quadrant for physics polygon (higher = smoother) */
  samplesPerQuarter?: number;// default 12
  rotationRad?: number;      // default 0
};

/** Create a 4-spike sparkle (like a twinkle). */
export const createSparkStar = (
  x: number,
  y: number,
  width: number,
  height: number,
  opts: SparkStarOpts = {},
  isStatic: boolean = false,
  shapeData: any
) => {
  const {
    color = "#FF5A1F",
    outlineColor = null,
    outlineWidth = 2,
    innerRatio = 0.22,
    curveMix = 0.55,
    curveAngle = Math.PI / 9,        // ~20°
    samplesPerQuarter = 12,
    rotationRad = 0,
  } = opts;

  const common = { restitution: 0.6, friction: 0.2, isStatic, render: { visible: false } };

  // Build a polygon that approximates the curved sparkle for physics.
  // r(theta) = 1 - (1 - innerRatio) * |sin(2θ)|^p  (p≈1.6 gives a nice pinch)
  const p = 1.6;
  const Rx = width / 2, Ry = height / 2;
  const steps = Math.max(4 * samplesPerQuarter, 16);
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < steps; i++) {
    const t = (i / steps) * Math.PI * 2;
    const rUnit = 1 - (1 - innerRatio) * Math.pow(Math.abs(Math.sin(2 * t)), p);
    const px = Math.cos(t) * Rx * rUnit;
    const py = Math.sin(t) * Ry * rUnit;
    // rotate
    const xr = px * Math.cos(rotationRad) - py * Math.sin(rotationRad);
    const yr = px * Math.sin(rotationRad) + py * Math.cos(rotationRad);
    pts.push({ x: xr, y: yr });
  }

  let body = Bodies.fromVertices(x, y, [pts], common, true) as Body | null;
  if (!body) {
    // fallback (rare: if decomp not available)
    body = Bodies.circle(x, y, Math.max(Rx, Ry) * 0.75, common);
  }

  const spark = Body.create({ parts: [body!], ...common });
  Body.setPosition(spark, Vector.create(x, y));
  Body.setAngle(spark, 0); // rotation handled by renderer via rotationRad

  shapeData.set(spark, {
    type: "sparkStar",
    w: width,
    h: height,
    color,
    outlineColor,
    outlineWidth,
    innerRatio,
    curveMix,
    curveAngle,
    rotationRad,
  });

  return spark;
};

/** Canvas renderer with smooth bezier curves (no reliance on polygon). */
export const renderSparkStar = (
  ctx: CanvasRenderingContext2D,
  body: Body,
  shapeData: any
) => {
  const data = shapeData.get(body);
  if (!data || data.type !== "sparkStar") return;

  const {
    w, h, color, outlineColor, outlineWidth,
    innerRatio, curveMix, curveAngle, rotationRad,
  } = data as {
    w: number; h: number; color: string; outlineColor: string | null; outlineWidth: number;
    innerRatio: number; curveMix: number; curveAngle: number; rotationRad: number;
  };

  const { x, y } = body.position;
  const Rx = w / 2, Ry = h / 2;

  // Work in unit circle then scale → easy ellipses
  const polar = (ang: number, r: number) => ({
    x: Math.cos(ang) * r,
    y: Math.sin(ang) * r,
  });
  const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

  const tips = [0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2];
  const valleys = tips.map(a => a + Math.PI / 4);

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(body.angle + rotationRad);
  ctx.scale(Rx, Ry);

  // Build path with cubic beziers between tip→valley→tip
  const start = polar(tips[0], 1);
  ctx.beginPath();
  ctx.moveTo(start.x, start.y);

  for (let i = 0; i < 4; i++) {
    const aTip = tips[i];
    const aVal = valleys[i];
    const aNextTip = tips[(i + 1) % 4];

    const T = polar(aTip, 1);
    const V = polar(aVal, Math.max(0.02, innerRatio));
    const N = polar(aNextTip, 1);

    const cR1 = lerp(1, innerRatio, curveMix);
    const cR2 = cR1;

    const C1 = polar(aTip + curveAngle, cR1);
    const C2 = polar(aVal - curveAngle, cR2);
    const C3 = polar(aVal + curveAngle, cR2);
    const C4 = polar(aNextTip - curveAngle, cR1);

    ctx.bezierCurveTo(C1.x, C1.y, C2.x, C2.y, V.x, V.y);
    ctx.bezierCurveTo(C3.x, C3.y, C4.x, C4.y, N.x, N.y);
  }

  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();

  if (outlineColor) {
    ctx.lineWidth = outlineWidth / Math.max(Rx, Ry); // normalize after scale
    ctx.strokeStyle = outlineColor;
    ctx.stroke();
  }

  ctx.restore();
};

type CloudOpts = {
  lobes?: number;              // how many puffs (3–9). default 5
  puffiness?: number;          // 0.5..1.2 scales lobe radii. default 0.9
  skewX?: number;              // horizontal drift of top puffs (wind). default 0
  color?: string;              // fill color. default "#F1FAEE"
  outlineColor?: string | null;// stroke color. null = no outline
  outlineWidth?: number;       // outline width in px
  shadowColor?: string | null; // soft drop shadow for the whole cloud
  shadowBlur?: number;         // px (only used when shadowColor)
  seed?: number;               // deterministic randomness
};

export const createCloud = (
  x: number,
  y: number,
  width: number,
  height: number,
  opts: CloudOpts = {},
  isStatic: boolean = false,
  shapeData: any
) => {
  const {
    lobes       = 5,
    puffiness   = 0.9,
    skewX       = 0,
    color       = "#F1FAEE",       // use your neutral from the palette
    outlineColor= "transparent",
    outlineWidth= 2,
    shadowColor = null,
    shadowBlur  = 14,
    seed        = 42,
  } = opts;

  const W = width, H = height;
  const n = Math.max(3, Math.min(9, Math.floor(lobes)));
  const rand = (() => { let s = seed; return () => (s = (s * 9301 + 49297) % 233280) / 233280; })();

  // Lobe layout along the width
  const centers: { x: number; y: number; r: number }[] = [];
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1 || 1);
    const cx = (t - 0.5) * W + (rand() - 0.5) * (W * 0.06) + (t - 0.5) * skewX;
    const up = 1 - Math.abs(2 * t - 1); // higher near center
    const cy = (0.18 - up * 0.22) * H + (rand() - 0.5) * (H * 0.04);
    const baseR = (H * 0.42) * (0.65 + up * 0.5); // bigger near center
    const r = baseR * puffiness * (0.9 + rand() * 0.2);
    centers.push({ x: cx, y: cy, r });
  }

  // Physics: compound of circle parts
  const common = { restitution: 0.6, friction: 0.2, isStatic, render: { visible: false } };
  const parts = centers.map(c => Bodies.circle(x + c.x, y + c.y, Math.max(6, c.r), common));
  const cloud = Body.create({ parts, ...common });
  Body.setPosition(cloud, Vector.create(x, y));

  // Store render meta on the compound
  shapeData.set(cloud, {
    type: "cloud",
    W, H, centers,
    style: { color, outlineColor, outlineWidth, shadowColor, shadowBlur },
  });

  return cloud;
};

/** Simple convex hull (monotone chain) for a clean outer stroke */
function convexHull(pts: { x: number; y: number }[]) {
  const P = pts.slice().sort((a,b)=>a.x===b.x?a.y-b.y:a.x-b.x);
  const cross = (o:any,a:any,b:any)=> (a.x-o.x)*(b.y-o.y)-(a.y-o.y)*(b.x-o.x);
  const lower:any[]=[]; for (const p of P){ while(lower.length>=2&&cross(lower[lower.length-2],lower[lower.length-1],p)<=0) lower.pop(); lower.push(p); }
  const upper:any[]=[]; for (let i=P.length-1;i>=0;i--){ const p=P[i]; while(upper.length>=2&&cross(upper[upper.length-2],upper[upper.length-1],p)<=0) upper.pop(); upper.push(p); }
  upper.pop(); lower.pop(); return lower.concat(upper);
}

/** Renderer */
export const renderCloud = (
  ctx: CanvasRenderingContext2D,
  body: Body,
  shapeData: any
) => {
  const data = shapeData.get(body);
  if (!data || data.type !== "cloud") return;

  const { centers, style } = data as {
    centers: { x:number;y:number;r:number }[];
    style: { color:string; outlineColor:string|null; outlineWidth:number; shadowColor:string|null; shadowBlur:number };
  };
  const { color, outlineColor, outlineWidth, shadowColor, shadowBlur } = style;

  const { x, y } = body.position;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(body.angle);

  // Fill: draw overlapping circles (produces a smooth fluffy fill)
  if (shadowColor) { ctx.shadowColor = shadowColor; ctx.shadowBlur = shadowBlur; }
  ctx.fillStyle = color;
  for (const c of centers) {
    ctx.beginPath();
    ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
    ctx.fill();
  }
  // remove shadow for strokes/highlights
  ctx.shadowBlur = 0;

  // Outline: approximate the silhouette using a convex hull of sampled points
  if (outlineColor) {
    const samples: {x:number;y:number}[] = [];
    for (const c of centers) {
      const k = 10; // points per lobe
      for (let i=0;i<k;i++){
        const a = (i / k) * Math.PI * 2;
        samples.push({ x: c.x + Math.cos(a) * c.r, y: c.y + Math.sin(a) * c.r });
      }
    }
    const hull = convexHull(samples);
    if (hull.length >= 3) {
      ctx.beginPath();
      ctx.moveTo(hull[0].x, hull[0].y);
      for (let i=1;i<hull.length;i++) ctx.lineTo(hull[i].x, hull[i].y);
      ctx.closePath();
      ctx.lineJoin = "round";
      ctx.lineWidth = outlineWidth;
      ctx.strokeStyle = outlineColor;
      ctx.stroke();
    }
  }

  // Subtle top highlight
  const maxR = Math.max(...centers.map(c=>c.r));
  const grad = ctx.createRadialGradient(-maxR*0.4, -maxR*0.8, maxR*0.2, 0, 0, maxR*1.6);
  grad.addColorStop(0, "rgba(255,255,255,0.35)");
  grad.addColorStop(1, "rgba(255,255,255,0)");
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = grad;
  for (const c of centers) { // a few small highlights
    ctx.beginPath();
    ctx.arc(c.x - c.r*0.35, c.y - c.r*0.45, c.r*0.45, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalCompositeOperation = "source-over";

  ctx.restore();
};

type CShapeOpts = {
  fillColor?: string;        // C background
  outlineColor?: string | null;
  outlineWidth?: number;

  text?: string;             // curved text (e.g., "THAT'S A")
  textColor?: string;
  font?: string;             // canvas font, e.g. "bold 24px Inter"

  // geometry
  thicknessRatio?: number;   // innerR = outerR * (1 - thicknessRatio). default 0.33
  gapAngleRad?: number;      // opening size in radians. default 1.2 (~69°)
  rotationRad?: number;      // rotate whole C. default 0 (opening at +X)

  // text layout
  textSide?: "outer" | "inner"; // draw along the outer or inner arc. default "outer"
  textDirection?: "cw" | "ccw"; // along the arc. default "ccw" (reads bottom→top on left side)
  textPadRad?: number;          // angle padding from each end. default 0.22
  letterSpacing?: number;       // extra spacing in px along arc. default 0
};

export const createCShape = (
  x: number,
  y: number,
  outerRadius: number,
  opts: CShapeOpts = {},
  isStatic: boolean = false,
  shapeData: any
) => {
  const {
    fillColor = "#3BA3E5",
    outlineColor = "transparent",
    outlineWidth = 0,

    text = "",
    textColor = getDarkerTextColor(fillColor),
    font = "bold 26px sans-serif",

    thicknessRatio = 0.33,
    gapAngleRad = 1.2,        // ≈ 69°
    rotationRad = 0,

    textSide = "outer",
    textDirection = "ccw",
    textPadRad = 0.22,
    letterSpacing = 0,
  } = opts;

  const R = Math.max(12, outerRadius);
  const r = Math.max(4, R * (1 - Math.max(0.05, Math.min(0.9, thicknessRatio))));
  const sweep = Math.max(0.2, Math.PI * 2 - Math.max(0.2, Math.min(Math.PI * 1.9, gapAngleRad)));
  const a0 = rotationRad + gapAngleRad / 2;      // start angle (at right side by default)
  const a1 = rotationRad - gapAngleRad / 2 + Math.PI * 2; // end angle (CCW from a0)

  // Build a thick-arc polygon for physics
  const steps = Math.max(24, Math.floor(sweep * 24)); // density ~24 points per rad
  const outerPts: { x: number; y: number }[] = [];
  const innerPts: { x: number; y: number }[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    const ang = a0 + t * sweep; // CCW
    outerPts.push({ x: x + Math.cos(ang) * R, y: y + Math.sin(ang) * R });
  }
  for (let i = steps; i >= 0; i--) {
    const t = i / steps;
    const ang = a0 + t * sweep;
    innerPts.push({ x: x + Math.cos(ang) * r, y: y + Math.sin(ang) * r });
  }
  const pts = outerPts.concat(innerPts);

  const common = { restitution: 0.6, friction: 0.2, isStatic, render: { visible: false } };
  let body = Bodies.fromVertices(x, y, [pts], common, true) as Body | null;
  if (!body) body = Bodies.circle(x, y, R, common);

  const cBody = Body.create({ parts: [body!], ...common });
  Body.setPosition(cBody, Vector.create(x, y));

  shapeData.set(cBody, {
    type: "cShape",
    x, y, R, r, a0, a1, sweep,
    style: { fillColor, outlineColor, outlineWidth, text, textColor, font, textSide, textDirection, textPadRad, letterSpacing },
  });

  return cBody;
};

export const renderCShape = (
  ctx: CanvasRenderingContext2D,
  body: Body,
  shapeData: any
) => {
  const data = shapeData.get(body);
  if (!data || data.type !== "cShape") return;

  const { R, r, a0, a1, sweep, style } = data as any;
  const {
    fillColor, outlineColor, outlineWidth,
    text, textColor, font, textSide, textDirection, textPadRad, letterSpacing,
  } = style;

  const { x, y } = body.position;

  // Helper: thick arc path
  const pathArc = (outerR: number, innerR: number, start: number, end: number) => {
    ctx.beginPath();
    ctx.arc(0, 0, outerR, start, end, false);
    ctx.arc(0, 0, innerR, end, start, true);
    ctx.closePath();
  };

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(body.angle);

  // --- C background ---
  pathArc(R, r, a0, a1);
  ctx.fillStyle = fillColor;
  ctx.fill();
  if (outlineColor) { ctx.strokeStyle = outlineColor; ctx.lineWidth = outlineWidth; ctx.stroke(); }

  // --- Curved text (optional) ---
  if (text && text.trim().length) {
    const midR = textSide === "outer" ? (R + r) / 2 + (R - r) * 0.12 : (R + r) / 2 - (R - r) * 0.12;
    const start = a0 + textPadRad;
    const end   = a1 - textPadRad;
    const usableSweep = Math.max(0.05, end - start);

    // Measure approximate total text width in px to convert to angle spacing
    ctx.save();
    ctx.font = font;
    let linearWidth = ctx.measureText(text).width + Math.max(0, text.length - 1) * letterSpacing;
    ctx.restore();

    // angle per px on this radius
    const pxToRad = 1 / midR;
    const neededSweep = linearWidth * pxToRad;

    // choose direction and starting angle
    const dir = textDirection === "cw" ? 1 : -1;
    const textSweep = Math.min(usableSweep, neededSweep);
    const startAngle = dir === 1 ? start : end;

    // place characters
    ctx.save();
    ctx.font = font;
    ctx.fillStyle = textColor;
    ctx.textBaseline = "middle";
    ctx.textAlign = "center";

    // scale letter widths to angle space
    let ang = startAngle;
    const stepSign = dir === 1 ? 1 : -1;
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      const w = ctx.measureText(ch).width + (i < text.length - 1 ? letterSpacing : 0);
      const dAng = Math.min(usableSweep, w * pxToRad) * stepSign;

      // advance half step, draw, advance half step (center each glyph in its slot)
      ang += dAng / 2;
      ctx.save();
      ctx.translate(Math.cos(ang) * midR, Math.sin(ang) * midR);
      ctx.rotate(ang + (dir === 1 ? Math.PI / 2 : -Math.PI / 2)); // tangential orientation
      ctx.fillText(ch, 0, 0);
      ctx.restore();

      ang += dAng / 2;
      // stop if we ran out of arc
      if ((dir === 1 && ang > end) || (dir === -1 && ang < start)) break;
    }
    ctx.restore();
  }

  ctx.restore();
};