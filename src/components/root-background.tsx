"use client";

import { useEffect, useRef } from "react";

const INITIAL_ROOT_STEP = 32;
const ROOT_STEP_VARIATION = 8;
const ROOT_BRANCH_SPACING = 3;
const ROOT_GROWTH_RATE = 90;
const ROOT_LENGTH_GROWTH = 1.13;

type RootSegment = {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  width: number;
  opacity: number;
  shade: number;
};

function addSegment(
  segments: RootSegment[],
  startX: number,
  startY: number,
  angle: number,
  length: number,
  generation: number,
  shade: number
) {
  const endX = startX + Math.sin(angle) * length;
  const endY = startY + Math.cos(angle) * length;
  segments.push({
    startX,
    startY,
    endX,
    endY,
    width: Math.max(0.45, 2.1 * 0.62 ** generation),
    opacity: Math.max(0.08, 0.2 - generation * 0.035),
    shade
  });
  return { x: endX, y: endY };
}

function growLateralRoot(
  segments: RootSegment[],
  startX: number,
  startY: number,
  direction: -1 | 1,
  depth: number,
  pageWidth: number,
  scale = 1
) {
  const baseLength = Math.min(pageWidth * 0.2, 23 * ROOT_LENGTH_GROWTH ** depth) * scale;
  const startAngle = direction * (0.72 + Math.sin(depth * 2.37) * 0.24);
  let point = { x: startX, y: startY };

  for (let step = 0; step < 4; step += 1) {
    const angle = startAngle + direction * step * 0.055 + Math.sin(depth * 3.1 + step) * 0.07;
    point = addSegment(
      segments,
      point.x,
      point.y,
      angle,
      baseLength * 0.42 ** step,
      step,
      (depth + step) % 2
    );

    if (step < 2) {
      const twigDirection: -1 | 1 = step % 2 === 0 ? direction : direction === 1 ? -1 : 1;
      const twigAngle = angle + twigDirection * (0.68 + Math.sin(depth + step) * 0.12);
      const twigLength = baseLength * 0.18 * 0.48 ** step;
      let twigPoint = point;
      for (let twigStep = 0; twigStep < 3; twigStep += 1) {
        twigPoint = addSegment(
          segments,
          twigPoint.x,
          twigPoint.y,
          twigAngle + twigDirection * twigStep * 0.08,
          twigLength * 0.48 ** twigStep,
          step + twigStep + 1,
          (depth + twigStep) % 2
        );
      }
    }
  }
}

function buildRootNetwork(anchorX: number, anchorY: number, pageWidth: number, pageHeight: number) {
  const segments: RootSegment[] = [];
  let x = anchorX;
  let y = anchorY;
  let step = 0;
  let branchDepth = 0;
  const maxY = pageHeight + window.innerHeight;

  while (y < maxY) {
    const stepLength = INITIAL_ROOT_STEP + Math.sin(step * 1.73) * ROOT_STEP_VARIATION;
    const drift = Math.sin(step * 0.81) * Math.min(2.3, 0.55 + step * 0.012);
    const nextX = x + drift;
    const nextY = y + stepLength;
    segments.push({
      startX: x,
      startY: y,
      endX: nextX,
      endY: nextY,
      width: Math.max(0.8, 2.3 * 0.992 ** step),
      opacity: 0.2,
      shade: step % 3
    });

    if (step > 1 && step % ROOT_BRANCH_SPACING === 1) {
      const direction: -1 | 1 = Math.sin(step * 12.9898) > 0 ? 1 : -1;
      growLateralRoot(segments, x, y, direction, branchDepth, pageWidth);
      branchDepth += 1;
    }
    if (step > 4 && step % 7 === 4) {
      const direction: -1 | 1 = Math.sin(step * 7.233 + 3.1) > 0 ? 1 : -1;
      growLateralRoot(segments, x, y, direction, branchDepth, pageWidth, 0.58);
      branchDepth += 1;
    }

    x = nextX;
    y = nextY;
    step += 1;
  }

  return segments;
}

const ROOT_COLORS = ["#C6A85B", "#CDAC5E", "#D5B360"];

export function RootBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvasElement = canvasRef.current;
    if (!canvasElement) {
      return;
    }
    const drawingContext = canvasElement.getContext("2d");
    if (!drawingContext) {
      return;
    }

    const canvas: HTMLCanvasElement = canvasElement;
    const context: CanvasRenderingContext2D = drawingContext;
    let segments: RootSegment[] = [];
    let anchorX = 0;
    let anchorY = 0;
    let pageWidth = 0;
    let pageHeight = 0;
    let growthFront = 0;
    let lastFrame = 0;
    let frame = 0;

    function redraw(timestamp: number) {
      frame = 0;
      const logo = document.querySelector<HTMLElement>(".nativ-logo-mark");
      if (!logo) {
        return;
      }

      const logoBounds = logo.getBoundingClientRect();
      const nextAnchorX = logoBounds.left + logoBounds.width / 2;
      const nextAnchorY = logoBounds.bottom + window.scrollY;
      const nextPageWidth = document.documentElement.clientWidth;
      const nextPageHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
      const layoutChanged =
        nextAnchorX !== anchorX ||
        nextAnchorY !== anchorY ||
        nextPageWidth !== pageWidth ||
        nextPageHeight !== pageHeight;

      if (layoutChanged) {
        anchorX = nextAnchorX;
        anchorY = nextAnchorY;
        pageWidth = nextPageWidth;
        pageHeight = nextPageHeight;
        segments = buildRootNetwork(anchorX, anchorY, pageWidth, pageHeight);
      }

      const elapsed = lastFrame ? Math.min((timestamp - lastFrame) / 1000, 0.05) : 0;
      lastFrame = timestamp;
      growthFront = Math.max(growthFront, anchorY + INITIAL_ROOT_STEP, window.scrollY + window.innerHeight * 0.82);
      growthFront = Math.min(pageHeight + window.innerHeight, growthFront + elapsed * ROOT_GROWTH_RATE);

      const pixelRatio = window.devicePixelRatio;
      const canvasWidth = Math.round(window.innerWidth * pixelRatio);
      const canvasHeight = Math.round(window.innerHeight * pixelRatio);
      if (canvas.width !== canvasWidth || canvas.height !== canvasHeight) {
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        canvas.style.width = `${window.innerWidth}px`;
        canvas.style.height = `${window.innerHeight}px`;
      }

      context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, -window.scrollY * pixelRatio);
      context.clearRect(0, window.scrollY, window.innerWidth, window.innerHeight);
      context.lineCap = "round";
      context.lineJoin = "round";

      for (const segment of segments) {
        if (segment.startY >= growthFront) {
          continue;
        }
        const progress = Math.min(1, (growthFront - segment.startY) / (segment.endY - segment.startY));
        const endX = segment.startX + (segment.endX - segment.startX) * progress;
        const endY = segment.startY + (segment.endY - segment.startY) * progress;
        context.beginPath();
        context.moveTo(segment.startX, segment.startY);
        context.lineTo(endX, endY);
        context.strokeStyle = ROOT_COLORS[segment.shade];
        context.globalAlpha = segment.opacity;
        context.lineWidth = segment.width;
        context.stroke();
      }
      context.globalAlpha = 1;

      if (growthFront < pageHeight + window.innerHeight) {
        frame = window.requestAnimationFrame(redraw);
      } else {
        lastFrame = 0;
      }
    }

    function scheduleRedraw() {
      if (!frame) {
        frame = window.requestAnimationFrame(redraw);
      }
    }

    const resizeObserver = new ResizeObserver(scheduleRedraw);
    resizeObserver.observe(document.documentElement);
    resizeObserver.observe(document.body);
    const logo = document.querySelector(".nativ-logo-mark");
    if (logo) {
      resizeObserver.observe(logo);
    }
    window.addEventListener("resize", scheduleRedraw);
    window.addEventListener("scroll", scheduleRedraw, { passive: true });
    scheduleRedraw();

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", scheduleRedraw);
      window.removeEventListener("scroll", scheduleRedraw);
      if (frame) {
        window.cancelAnimationFrame(frame);
      }
    };
  }, []);

  return <canvas ref={canvasRef} className="root-background" aria-hidden="true" />;
}
