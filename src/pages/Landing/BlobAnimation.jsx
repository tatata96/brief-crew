import { useEffect, useRef } from 'react'
import Matter from 'matter-js'
import 'pathseg'
import decomp from 'poly-decomp'

if (typeof window !== 'undefined') {
  window.decomp = decomp
}

const BlobAnimation = () => {
  const sceneRef = useRef(null)
  const engineRef = useRef(Matter.Engine.create())

  useEffect(() => {
    const engine = engineRef.current
    const { world } = engine
    const element = sceneRef.current
    const { width, height } = element.getBoundingClientRect()

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

    const path =
      'M64.4,-15.7C74.6,13.6,69.2,53.7,46.3,69.7C23.3,85.6,-17.3,77.3,-40.2,58.7C-63,40.1,-67.9,11.1,-58.1,-14.3C-48.4,-39.6,-24.2,-61.2,-0.7,-61.1C22.7,-61.1,45.5,-39.2,64.4,-15.7Z'

    const createBlob = (x) => {
      const svgPath = document.createElementNS('http://www.w3.org/2000/svg', 'path')
      svgPath.setAttribute('d', path)
      const vertices = Matter.Svg.pathToVertices(svgPath, 25)
      const body = Matter.Bodies.fromVertices(x, -50, vertices, {
        render: {
          fillStyle: '#6C63FF',
        },
      })
      return body
    }

    const blobs = []
    const count = 5
    for (let i = 0; i < count; i++) {
      const x = (width / (count + 1)) * (i + 1)
      blobs.push(createBlob(x))
    }
    Matter.World.add(world, blobs)

    return () => {
      Matter.Render.stop(render)
      Matter.World.clear(world)
      Matter.Engine.clear(engine)
      render.canvas.remove()
      render.textures = {}
    }
  }, [])

  return <div ref={sceneRef} className="blob-canvas" />
}

export default BlobAnimation

