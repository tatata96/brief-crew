import { Bodies, Body, Vector } from "matter-js";

export interface MartiniGlassOptions {
  bowlColor: string;
  stemColor: string;
  baseColor: string;
  outlineColor: string | null;
  showCollision?: boolean; // Optional debug flag to show collision bodies
}

export interface CogwheelOptions {
  fillColor: string;
  pointCount: number;
  innerRadius: number;
  outerRadius: number;
}

export interface StarOptions {
  fillColor: string;
  pointCount: number;
  innerRadius: number;
  outerRadius: number;
}

export function createMartiniGlass(
  x: number,
  y: number,
  height: number,
  options: MartiniGlassOptions,
  isStatic: boolean,
  shapeData: Map<Body, any>
): Body {
  // Create a more accurate collision shape for the martini glass
  // Using a compound body with multiple parts to better match the visual shape
  const rimWidth = height * 0.60;
  const bowlDepth = height * 0.26;
  const stemHeight = height * 0.44;
  const baseWidth = height * 0.28;
  
  // Bowl collision (triangular area) - make it wider for better collision detection
  const bowl = Bodies.rectangle(x, y - height/2 + bowlDepth/2, rimWidth * 1.1, bowlDepth, {
    isStatic,
    isSensor: false,
    collisionFilter: { group: 0 },
    render: { visible: options.showCollision || false },
  });
  
  // Stem collision - make it slightly thicker for better collision detection
  const stem = Bodies.rectangle(x, y + stemHeight/2, height * 0.04, stemHeight, {
    isStatic,
    isSensor: false,
    collisionFilter: { group: 0 },
    render: { visible: options.showCollision || false },
  });
  
  // Base collision - make it slightly thicker for better collision detection
  const base = Bodies.rectangle(x, y + height/2 - baseWidth/4, baseWidth, height * 0.04, {
    isStatic,
    isSensor: false,
    collisionFilter: { group: 0 },
    render: { visible: options.showCollision || false },
  });
  
  // Combine into a compound body
  const body = Body.create({
    parts: [bowl, stem, base],
    isStatic,
    collisionFilter: { group: 0 },
    render: { visible: options.showCollision || false },
  });

  shapeData.set(body, { type: "martiniGlass", x, y, height, options });
  return body;
}

export function createCogwheel(
  x: number,
  y: number,
  size: number,
  options: CogwheelOptions,
  isStatic: boolean,
  shapeData: Map<Body, any>
): Body {
  const body = Bodies.circle(x, y, size / 2, {
    isStatic,
    restitution: 0.6,
    friction: 0.3,
    density: 0.001,
    render: { visible: false },
  });

  shapeData.set(body, { type: "cogwheel", x, y, size, options });
  return body;
}

export function createStar(
  x: number,
  y: number,
  size: number,
  options: StarOptions,
  isStatic: boolean,
  shapeData: Map<Body, any>
): Body {
  const body = Bodies.circle(x, y, size / 2, {
    isStatic,
    restitution: 0.6,
    friction: 0.2,
    density: 0.001,
    render: { visible: false },
  });

  shapeData.set(body, { type: "star", x, y, size, options });
  return body;
}
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

  const common = { restitution: 0.7, friction: 0.4, density: 0.001, isStatic, render: { visible: false } };

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


export function renderMartiniGlass(
  ctx: CanvasRenderingContext2D,
  body: Body,
  shapeData: Map<Body, any>
): void {
  const data = shapeData.get(body);
  if (data?.type !== "martiniGlass") return;

  const { x, y, height, options } = data as {
    x: number; y: number; height: number; options: MartiniGlassOptions;
  };
  const { bowlColor, stemColor, baseColor, outlineColor } = options;

  // Proportions tuned to the reference "Y" silhouette
  const rimWidth   = height * 0.60;   // top width
  const bowlDepth  = height * 0.26;   // top to joint
  const stemHeight = height * 0.44;   // joint to base
  const baseWidth  = height * 0.28;   // base foot width

  const rimY   = y - height / 2;
  const jointX = x;
  const jointY = rimY + bowlDepth;
  const baseY  = jointY + stemHeight;

  const leftX  = x - rimWidth / 2;
  const rightX = x + rimWidth / 2;

  const lw = Math.max(2, Math.round(height * 0.02));

  ctx.save();
  ctx.lineWidth = lw;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.miterLimit = 2;

  // Left arm
  ctx.strokeStyle = outlineColor ?? bowlColor;
  ctx.beginPath();
  ctx.moveTo(leftX, rimY);
  ctx.lineTo(jointX, jointY);
  ctx.stroke();

  // Right arm
  ctx.beginPath();
  ctx.moveTo(rightX, rimY);
  ctx.lineTo(jointX, jointY);
  ctx.stroke();

  // Stem
  ctx.strokeStyle = outlineColor ?? stemColor;
  ctx.beginPath();
  ctx.moveTo(jointX, jointY);
  ctx.lineTo(jointX, baseY);
  ctx.stroke();

  // Base
  ctx.strokeStyle = outlineColor ?? baseColor;
  ctx.beginPath();
  ctx.moveTo(x - baseWidth / 2, baseY);
  ctx.lineTo(x + baseWidth / 2, baseY);
  ctx.stroke();

  ctx.restore();
}

export function renderCogwheel(
  ctx: CanvasRenderingContext2D,
  body: Body,
  shapeData: Map<Body, any>
): void {
  const data = shapeData.get(body);
  if (data?.type !== "cogwheel") return;

  const { x, y, size, options } = data as {
    x: number; y: number; size: number; options: CogwheelOptions;
  };
  const { fillColor, pointCount, innerRadius, outerRadius } = options;

  ctx.save();
  ctx.fillStyle = fillColor;
  ctx.beginPath();

  // Draw cogwheel with points
  for (let i = 0; i < pointCount; i++) {
    const angle = (i * 2 * Math.PI) / pointCount;
    const nextAngle = ((i + 1) * 2 * Math.PI) / pointCount;
    
    // Outer point
    const outerX = x + Math.cos(angle) * outerRadius;
    const outerY = y + Math.sin(angle) * outerRadius;
    
    // Inner point (between teeth)
    const innerAngle = angle + (Math.PI / pointCount);
    const innerX = x + Math.cos(innerAngle) * innerRadius;
    const innerY = y + Math.sin(innerAngle) * innerRadius;
    
    if (i === 0) {
      ctx.moveTo(outerX, outerY);
    } else {
      ctx.lineTo(outerX, outerY);
    }
    
    ctx.lineTo(innerX, innerY);
  }
  
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function renderStar(
  ctx: CanvasRenderingContext2D,
  body: Body,
  shapeData: Map<Body, any>
): void {
  const data = shapeData.get(body);
  if (data?.type !== "star") return;

  const { x, y, size, options } = data as {
    x: number; y: number; size: number; options: StarOptions;
  };
  const { fillColor, pointCount, innerRadius, outerRadius } = options;

  ctx.save();
  
  // Add subtle glow effect
  ctx.shadowColor = fillColor;
  ctx.shadowBlur = 8;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  
  // Draw star with alternating outer and inner points
  ctx.beginPath();
  for (let i = 0; i < pointCount * 2; i++) {
    const angle = (i * Math.PI) / pointCount;
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    
    const pointX = x + Math.cos(angle) * radius;
    const pointY = y + Math.sin(angle) * radius;
    
    if (i === 0) {
      ctx.moveTo(pointX, pointY);
    } else {
      ctx.lineTo(pointX, pointY);
    }
  }
  
  ctx.closePath();
  
  // Fill with main color
  ctx.fillStyle = fillColor;
  ctx.fill();
  
  // Add highlight in center
  ctx.shadowBlur = 0;
  ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
  ctx.beginPath();
  ctx.arc(x, y, innerRadius * 0.3, 0, Math.PI * 2);
  ctx.fill();
  
  ctx.restore();
}
