import { Bodies, Body } from "matter-js";

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