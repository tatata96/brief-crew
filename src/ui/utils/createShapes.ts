import { Bodies, Body } from "matter-js";

export const createCircle = (x: number, y: number, radius: number, isStatic: boolean = false, shapeData: any) => {
  const body = Bodies.circle(x, y, radius, {
    restitution: 0.6,
    friction: 0.2,
    isStatic,
    render: { visible: false },
  });
  shapeData.set(body, { type: 'circle', color: '#ff8a00', size: radius });
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