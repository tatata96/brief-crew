import { Bodies, Body } from "matter-js";

export interface MartiniGlassOptions {
  bowlColor: string;
  stemColor: string;
  baseColor: string;
  outlineColor: string | null;
}

export function createMartiniGlass(
  x: number,
  y: number,
  height: number,
  options: MartiniGlassOptions,
  isStatic: boolean,
  shapeData: Map<Body, any>
): Body {
  // Invisible placeholder body used only for positioning + metadata.
  const body = Bodies.rectangle(x, y, height * 0.6, height, {
    isStatic,
    isSensor: true,                   // don’t block physics objects
    collisionFilter: { mask: 0 },     // ignore collisions entirely
    render: { visible: false },
  });

  shapeData.set(body, { type: "martiniGlass", x, y, height, options });
  return body;
}

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

  // Proportions tuned to the reference “Y” silhouette
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
