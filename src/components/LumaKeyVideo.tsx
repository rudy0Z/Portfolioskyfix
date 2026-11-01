"use client"

import React, { useEffect, useRef, useState } from "react"

export interface LumaKeyVideoProps {
  src: string
  fallbackSrc: string
  alt?: string
  className?: string
  style?: React.CSSProperties
  /** White keying threshold (0.0–1.0). Pixels brighter than this become transparent. Default 0.96 */
  threshold?: number
  /** Feather falloff range for smooth anti-aliased edge. Default 0.03 */
  feather?: number
}

const VERT_SRC = `
attribute vec2 a_position;
attribute vec2 a_texCoord;
varying vec2 v_texCoord;
void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
  v_texCoord = a_texCoord;
}
`

const FRAG_SRC = `
precision mediump float;
varying vec2 v_texCoord;
uniform sampler2D u_image;
uniform float u_threshold;
uniform float u_feather;

void main() {
  vec4 color = texture2D(u_image, v_texCoord);
  // Calculate lightness from min RGB channel (pure white has all 3 channels high)
  float minC = min(min(color.r, color.g), color.b);
  
  // Smoothly taper alpha to zero near pure white
  float alpha = 1.0 - smoothstep(u_threshold - u_feather, u_threshold, minC);
  
  // Discard completely white pixels for zero edge halo
  if (minC >= u_threshold) {
    discard;
  }
  
  gl_FragColor = vec4(color.rgb, color.a * alpha);
}
`

export function LumaKeyVideo({
  src,
  fallbackSrc,
  alt = "Character desk loop",
  className = "",
  style,
  threshold = 0.96,
  feather = 0.03,
}: LumaKeyVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [hasError, setHasError] = useState(false)

  useEffect(() => {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || hasError) return

    video.muted = true
    video.defaultMuted = true
    const playPromise = video.play()
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        // Autoplay may be restricted before user interaction; fallback image is active
      })
    }

    let animId: number
    let gl: WebGLRenderingContext | null = null

    try {
      gl = canvas.getContext("webgl", {
        alpha: true,
        premultipliedAlpha: false,
        antialias: true,
      })
    } catch {
      gl = null
    }

    if (!gl) {
      return
    }

    const createShader = (type: number, source: string) => {
      const shader = gl!.createShader(type)
      if (!shader) return null
      gl!.shaderSource(shader, source)
      gl!.compileShader(shader)
      return shader
    }

    const vert = createShader(gl.VERTEX_SHADER, VERT_SRC)
    const frag = createShader(gl.FRAGMENT_SHADER, FRAG_SRC)
    if (!vert || !frag) return

    const program = gl.createProgram()
    if (!program) return
    gl.attachShader(program, vert)
    gl.attachShader(program, frag)
    gl.linkProgram(program)
    gl.useProgram(program)

    // Full canvas quad
    const posBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1,
      ]),
      gl.STATIC_DRAW
    )

    const aPos = gl.getAttribLocation(program, "a_position")
    gl.enableVertexAttribArray(aPos)
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0)

    // Texture coords (flipped vertically for HTML video source)
    const texBuffer = gl.createBuffer()
    gl.bindBuffer(gl.ARRAY_BUFFER, texBuffer)
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        0, 1,
        1, 1,
        0, 0,
        0, 0,
        1, 1,
        1, 0,
      ]),
      gl.STATIC_DRAW
    )

    const aTex = gl.getAttribLocation(program, "a_texCoord")
    gl.enableVertexAttribArray(aTex)
    gl.vertexAttribPointer(aTex, 2, gl.FLOAT, false, 0, 0)

    // Setup texture
    const texture = gl.createTexture()
    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)

    // Uniform locations
    const uThreshold = gl.getUniformLocation(program, "u_threshold")
    const uFeather = gl.getUniformLocation(program, "u_feather")
    gl.uniform1f(uThreshold, threshold)
    gl.uniform1f(uFeather, feather)

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)

    const render = () => {
      if (video.readyState >= video.HAVE_CURRENT_DATA && gl) {
        if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
          canvas.width = video.videoWidth || 960
          canvas.height = video.videoHeight || 540
          gl.viewport(0, 0, canvas.width, canvas.height)
        }

        gl.bindTexture(gl.TEXTURE_2D, texture)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video)
        gl.clearColor(0, 0, 0, 0)
        gl.clear(gl.COLOR_BUFFER_BIT)
        gl.drawArrays(gl.TRIANGLES, 0, 6)

        if (!isVideoPlaying) {
          setIsVideoPlaying(true)
        }
      }

      animId = requestAnimationFrame(render)
    }

    animId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animId)
      if (gl) {
        gl.deleteTexture(texture)
        gl.deleteProgram(program)
      }
    }
  }, [hasError, threshold, feather, isVideoPlaying])

  return (
    <div
      className={`luma-key-video-container relative w-full h-full flex items-center justify-center ${className}`}
      style={style}
    >
      {/* Underlying video stream (rendered at 320x180 with tiny opacity so browser continuously decodes frames) */}
      <video
        ref={videoRef}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        style={{
          position: "absolute",
          opacity: 0.001,
          pointerEvents: "none",
          width: "320px",
          height: "180px",
          zIndex: -10,
        }}
        onError={() => setHasError(true)}
      >
        <source src={src} type="video/mp4" />
      </video>

      {/* Real-time WebGL Luma-Keyed Canvas */}
      <canvas
        ref={canvasRef}
        className={`w-full h-full object-contain pointer-events-none select-none transition-opacity duration-700 ${
          isVideoPlaying && !hasError ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Clean Alpha-Matted Cutout Fallback (displayed instantly until video stream is decoded) */}
      <img
        src={fallbackSrc}
        alt={alt}
        className={`absolute inset-0 w-full h-full object-contain pointer-events-none select-none transition-opacity duration-700 ${
          isVideoPlaying && !hasError ? "opacity-0 pointer-events-none" : "opacity-100"
        }`}
        loading="eager"
      />
    </div>
  )
}

export default LumaKeyVideo
