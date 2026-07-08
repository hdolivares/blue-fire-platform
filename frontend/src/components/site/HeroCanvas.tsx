"use client";

import { useEffect, useRef } from "react";
import { reducedMotion } from "./gsap";

/**
 * Hand-written WebGL mist: domain-warped fbm noise rendered at reduced
 * resolution and upscaled (the mist is soft by nature, so this is cheap).
 * Deep navy → blue vapor with cyan glints, a faint warm ember pooled low
 * (the "fire" in BlueFire), a sparse droplet-sparkle field, mouse drift
 * and a scroll-linked fade. Falls back to the CSS gradient underneath
 * when WebGL is unavailable or the user prefers reduced motion.
 */

const VERT = `
attribute vec2 aPos;
void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uScroll;

float hash(vec2 p) {
  p = fract(p * vec2(234.34, 435.345));
  p += dot(p, p + 34.23);
  return fract(p.x * p.y);
}
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}
float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = rot * p;
    a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  vec2 p = vec2(uv.x * uRes.x / uRes.y, uv.y);
  float t = uTime * 0.05;
  vec2 m = (uMouse - 0.5) * 0.22;

  p.y += uScroll * 0.35;

  vec2 drift = vec2(t * 0.35, -t * 0.22);
  float q = fbm(p * 1.7 + drift + m);
  float r = fbm(p * 1.7 - drift.yx + q * 0.9);
  float v = fbm(p * 2.3 + r * 1.4 + vec2(0.0, -t * 0.6));

  // vertical wash: void above, deep water blue below
  vec3 col = mix(vec3(0.012, 0.027, 0.055), vec3(0.031, 0.078, 0.157), pow(1.0 - uv.y, 1.35));

  // vapor body, concentrated toward the floor of the frame
  float band = smoothstep(1.0, 0.42, uv.y);
  vec3 mist = mix(vec3(0.030, 0.140, 0.290), vec3(0.086, 0.360, 0.620), smoothstep(0.35, 0.80, v));
  col = mix(col, mist, band * smoothstep(0.25, 0.75, v) * 0.85);

  // cyan glints where the vapor peaks
  col += vec3(0.34, 0.85, 1.0) * pow(smoothstep(0.58, 0.95, v), 2.2) * band * 0.42;

  // horizon glow
  float hg = exp(-abs(uv.y - 0.34) * 7.5);
  col += vec3(0.10, 0.38, 0.66) * hg * 0.30 * (0.75 + 0.25 * r);

  // ember warmth licking through its own turbulence, pooled low-left
  float e = fbm(p * 2.8 + vec2(t * 1.4, t * 0.9));
  float ember = smoothstep(0.9, 0.05, distance(uv, vec2(0.16, -0.05)))
              * pow(smoothstep(0.42, 0.95, e), 1.7);
  col += vec3(1.0, 0.42, 0.20) * ember * 0.5;

  // sparse droplet sparkle field
  vec2 g = vec2(uv.x * uRes.x / uRes.y, uv.y) * 40.0;
  vec2 cell = floor(g);
  float sp = hash(cell);
  vec2 f = fract(g) - 0.5;
  float star = smoothstep(0.10, 0.0, length(f))
             * step(0.992, sp)
             * (0.5 + 0.5 * sin(uTime * (1.2 + sp * 2.5) + sp * 40.0));
  col += vec3(0.55, 0.85, 1.0) * star * 0.4 * band;

  // vignette, scroll fade, grain
  col *= 1.0 - 0.5 * pow(distance(uv, vec2(0.5, 0.42)) * 1.3, 1.6);
  col *= 1.0 - uScroll * 0.45;
  col += (hash(gl_FragCoord.xy + fract(uTime) * 100.0) - 0.5) * 0.03;

  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const sh = gl.createShader(type);
  if (!sh) return null;
  gl.shaderSource(sh, src);
  gl.compileShader(sh);
  if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) {
    console.warn("BlueFire shader:", gl.getShaderInfoLog(sh));
    gl.deleteShader(sh);
    return null;
  }
  return sh;
}

export default function HeroCanvas() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas || reducedMotion()) return;

    const gl = canvas.getContext("webgl", {
      antialias: false,
      alpha: false,
      depth: false,
      stencil: false,
    });
    if (!gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) return;
    const prog = gl.createProgram();
    if (!prog) return;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
      console.warn("BlueFire shader link:", gl.getProgramInfoLog(prog));
      return;
    }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 3, -1, -1, 3]),
      gl.STATIC_DRAW
    );
    const loc = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, "uRes");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uMouse = gl.getUniformLocation(prog, "uMouse");
    const uScroll = gl.getUniformLocation(prog, "uScroll");

    // Render small, upscale — mist doesn't need pixels.
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    const scale = Math.min(window.devicePixelRatio || 1, 2) * (coarse ? 0.42 : 0.55);

    const resize = () => {
      const w = Math.max(1, Math.round(wrap.clientWidth * scale));
      const h = Math.max(1, Math.round(wrap.clientHeight * scale));
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
      }
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);

    // Pointer drift (lerped in the loop).
    const mouse = { x: 0.5, y: 0.5, tx: 0.5, ty: 0.5 };
    const onMove = (e: PointerEvent) => {
      mouse.tx = e.clientX / window.innerWidth;
      mouse.ty = 1 - e.clientY / window.innerHeight;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let raf = 0;
    let running = false;
    let inView = true;
    let visible = !document.hidden;
    const t0 = performance.now();

    const frame = () => {
      raf = 0;
      if (!running) return;
      const now = (performance.now() - t0) / 1000;
      mouse.x += (mouse.tx - mouse.x) * 0.045;
      mouse.y += (mouse.ty - mouse.y) * 0.045;
      const sc = Math.min(
        1,
        Math.max(0, window.scrollY / Math.max(1, window.innerHeight))
      );
      gl.uniform1f(uTime, now);
      gl.uniform2f(uMouse, mouse.x, mouse.y);
      gl.uniform1f(uScroll, sc);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      raf = requestAnimationFrame(frame);
    };

    const sync = () => {
      const should = inView && visible;
      if (should && !running) {
        running = true;
        raf = requestAnimationFrame(frame);
      } else if (!should && running) {
        running = false;
        if (raf) cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const io = new IntersectionObserver((entries) => {
      inView = entries[0]?.isIntersecting ?? true;
      sync();
    });
    io.observe(wrap);
    const onVis = () => {
      visible = !document.hidden;
      sync();
    };
    document.addEventListener("visibilitychange", onVis);

    sync();
    // fade the canvas in over the CSS fallback
    requestAnimationFrame(() => wrap.classList.add("is-live"));

    return () => {
      running = false;
      if (raf) cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("pointermove", onMove);
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, []);

  return (
    <div ref={wrapRef} className="bf-hero-canvas" aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
