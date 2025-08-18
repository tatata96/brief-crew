import { Bodies, Body, Vector } from "matter-js";

export const createCircle = (x: number, y: number, radius: number, isStatic: boolean = false, shapeData: any, isHalfCircle: boolean = false, color: string = "#87CEEB") => {
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
  rectColor: string = "#F7C500",          // default: yellow
  circleColors: string | string[] = "#000",// default: black
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
  color: string = "#FFA24A",
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
  scleraColor: string = "#FFFFFF",
  irisColor: string = "#3AA0FF",
  pupilColor: string = "#000000",
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
  const bowlColor   = options.bowlColor   ?? "#F24E1E";
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

    oliveColor = "#B8E866",
    pimentoColor = "#FF3B2F",
    rodColor = "#BFC6CF",
    ballColor = "#BFC6CF",
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
