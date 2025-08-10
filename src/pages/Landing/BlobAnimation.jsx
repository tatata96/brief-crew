import { useEffect, useRef } from 'react'
import Matter from 'matter-js'
import 'pathseg'
import decomp from 'poly-decomp'
import svgShapes from '../../assets/svg'

if (typeof window !== 'undefined') {
  window.decomp = decomp
}

const BlobAnimation = () => {
  console.log('BlobAnimation: Starting initialization...')
  const sceneRef = useRef(null)
  const engineRef = useRef(Matter.Engine.create())

  useEffect(() => {
    console.log('BlobAnimation: Starting initialization...')
    console.log('Available SVG shapes:', Object.keys(svgShapes))
    
    const engine = engineRef.current
    const { world } = engine
    const element = sceneRef.current
    const { width, height } = element.getBoundingClientRect()

    console.log('Canvas dimensions:', { width, height })

    const render = Matter.Render.create({
      element,
      engine,
      options: {
        width,
        height,
        background: 'transparent',
        wireframes: false,
      },
    })

    Matter.Render.run(render)
    const runner = Matter.Runner.create()
    Matter.Runner.run(runner, engine)

    const floor = Matter.Bodies.rectangle(width / 2, height + 50, width, 100, {
      isStatic: true,
    })
    Matter.World.add(world, floor)

    // Add side walls to contain the blobs
    const leftWall = Matter.Bodies.rectangle(-50, height / 2, 100, height, {
      isStatic: true,
    })
    const rightWall = Matter.Bodies.rectangle(width + 50, height / 2, 100, height, {
      isStatic: true,
    })
    Matter.World.add(world, [leftWall, rightWall])

    // Convert svg string to Document
    const svgStringToDocument = (string) =>
      new window.DOMParser().parseFromString(string, "image/svg+xml");

    // Extract SVG Element from a Document
    const getSvg = (svg) => svg.querySelector("svg");

    // Extract paths from an SVG Element
    const getPaths = (svg) => Array.from(svg.querySelectorAll("path"));

    // Fetch SVG content from URL
    const fetchSvgContent = async (url) => {
      try {
        const response = await fetch(url);
        return await response.text();
      } catch (error) {
        console.error('Error fetching SVG:', error);
        return null;
      }
    };

    // Create data for each SVG
    const makeShape = async (name) => {
      try {
        const svgUrl = svgShapes[name];
        console.log(`Fetching SVG for ${name}:`, svgUrl);
        
        const svgContent = await fetchSvgContent(svgUrl);
        if (!svgContent) {
          console.error(`Failed to fetch SVG content for ${name}`);
          return null;
        }
        
        const svgDocument = svgStringToDocument(svgContent);
        const svgElement = getSvg(svgDocument);
        const paths = getPaths(svgElement);
        
        console.log(`Created shape ${name} with ${paths.length} paths`);
        
        return {
          name,
          paths
        };
      } catch (error) {
        console.error(`Error creating shape ${name}:`, error);
        return null;
      }
    };

    // Initialize the animation
    const initAnimation = async () => {
      const shapeNames = Object.keys(svgShapes);
      const shapes = [];
      
      // Create shapes for all available SVGs
      for (const name of shapeNames) {
        const shape = await makeShape(name);
        if (shape) {
          shapes.push(shape);
        }
      }
      
      console.log(`Successfully loaded ${shapes.length} shapes from SVGs`);

      // Fallback: if no SVG shapes loaded, create a simple blob
      if (shapes.length === 0) {
        console.warn('No SVG shapes loaded, creating fallback blob');
        const fallbackPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        fallbackPath.setAttribute('d', 'M64.4,-15.7C74.6,13.6,69.2,53.7,46.3,69.7C23.3,85.6,-17.3,77.3,-40.2,58.7C-63,40.1,-67.9,11.1,-58.1,-14.3C-48.4,-39.6,-24.2,-61.2,-0.7,-61.1C22.7,-61.1,45.5,-39.2,64.4,-15.7Z');
        shapes.push({
          name: 'fallback',
          paths: [fallbackPath]
        });
      }

      const createBlobFromShape = (shape, x, y) => {
        try {
          // Convert paths to vertices
          const vertexSets = shape.paths.map((path) => {
            try {
              return Matter.Svg.pathToVertices(path, 30);
            } catch (error) {
              console.error(`Error converting path to vertices for ${shape.name}:`, error);
              return null;
            }
          }).filter(Boolean); // Remove null entries

          if (vertexSets.length === 0) {
            console.warn(`No valid vertices for shape ${shape.name}`);
            return null;
          }

          // Create the physics body with varied properties
          const body = Matter.Bodies.fromVertices(x, y, vertexSets, {
            label: shape.name,
            render: {
              fillStyle: getRandomColor(),
            },
            // Add some variety to the physics
            friction: 0.1 + Math.random() * 0.2,
            restitution: 0.3 + Math.random() * 0.4,
            density: 0.001 + Math.random() * 0.002,
          });
          
          // Add some initial rotation and velocity for more dynamic movement
          Matter.Body.setAngularVelocity(body, (Math.random() - 0.5) * 0.1);
          Matter.Body.setVelocity(body, {
            x: (Math.random() - 0.5) * 2,
            y: Math.random() * 3 + 2
          });
          
          return body;
        } catch (error) {
          console.error(`Error creating blob for shape ${shape.name}:`, error);
          return null;
        }
      };

      const getRandomColor = () => {
        const colors = [
          '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
          '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
          '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
      };

      const getRandomBetween = (min, max) => Math.random() * (max - min) + min;

      // Create blobs from shapes
      const blobs = [];
      shapes.forEach((shape, index) => {
        const x = getRandomBetween(width * 0.1, width * 0.9);
        const y = getRandomBetween(-200, -50);
        const blob = createBlobFromShape(shape, x, y);
        if (blob) {
          blobs.push(blob);
        }
      });

      console.log(`Created ${blobs.length} blobs`);

      if (blobs.length > 0) {
        Matter.World.add(world, blobs);
      }

      // Add new blobs periodically to keep the animation dynamic
      const addNewBlob = () => {
        if (shapes.length > 0) {
          const randomShape = shapes[Math.floor(Math.random() * shapes.length)];
          const x = getRandomBetween(width * 0.1, width * 0.9);
          const y = getRandomBetween(-100, -50);
          const newBlob = createBlobFromShape(randomShape, x, y);
          if (newBlob) {
            Matter.World.add(world, newBlob);
          }
        }
      };

     

      return blobInterval;
    };

    // Start the animation
    let blobInterval;
    initAnimation().then(interval => {
      blobInterval = interval;
    });

    return () => {
      if (blobInterval) {
        clearInterval(blobInterval);
      }
      Matter.Render.stop(render);
      Matter.World.clear(world);
      Matter.Engine.clear(engine);
      render.canvas.remove();
      render.textures = {};
    };
  }, []);

  return <div ref={sceneRef} className="blob-canvas" />;
};

export default BlobAnimation;

