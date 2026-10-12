"use client";

import { useLayoutEffect, useRef, useState, type PointerEvent } from "react";
import { ZoomIn, ZoomOut } from "lucide-react";
import type { ImageAsset } from "@/data/portfolio";
import {
  PerspectiveCarousel,
  type PerspectiveCarouselItem,
} from "@/components/ui/perspective-carousel";

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 6;
const clampZoom = (value: number) =>
  Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value));

export function ZoomableImage({
  asset,
  items,
  activeIndex,
  onActiveIndexChange,
}: {
  asset: ImageAsset;
  items: PerspectiveCarouselItem[];
  activeIndex: number;
  onActiveIndexChange: (index: number) => void;
}) {
  const viewport = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 1, height: 1 });
  const [zoom, setZoom] = useState(1);
  const zoomRef = useRef(1);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef({ x: 0, y: 0, left: 0, top: 0, distance: 0, zoom: 1 });
  const frame = useRef(0);
  const fit = Math.min(
    Math.max(1, size.width - 96) / asset.width,
    Math.max(1, size.height - 32) / asset.height,
  );
  const width = Math.round(asset.width * fit * zoom);
  const height = Math.round(asset.height * fit * zoom);

  function changeZoom(value: number) {
    zoomRef.current = clampZoom(value);
    setZoom(zoomRef.current);
  }
  function fitImage() {
    changeZoom(1);
    viewport.current?.scrollTo({ left: 0, top: 0 });
  }
  function fitWidth() {
    changeZoom(Math.max(1, size.width - 32) / (asset.width * fit));
  }
  useLayoutEffect(() => {
    const element = viewport.current;
    if (!element) return;
    // Scrollbars and fractional layout measurements must not feed back into fit.
    function measure() {
      const width = element!.clientWidth;
      const height = element!.clientHeight;
      setSize((previous) =>
        previous.width === width && previous.height === height
          ? previous
          : { width, height },
      );
    }
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    function wheel(event: WheelEvent) {
      event.preventDefault();
      zoomRef.current = clampZoom(
        zoomRef.current * Math.exp(-event.deltaY * 0.002),
      );
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => setZoom(zoomRef.current));
    }
    element.addEventListener("wheel", wheel, { passive: false });
    return () => {
      observer.disconnect();
      element.removeEventListener("wheel", wheel);
      cancelAnimationFrame(frame.current);
    };
  }, []);

  function distance() {
    const [first, second] = [...pointers.current.values()];
    return second ? Math.hypot(second.x - first.x, second.y - first.y) : 0;
  }
  function startGesture(event: PointerEvent<HTMLDivElement>) {
    // Neighbor selection is a button action, not an image-pan gesture.
    if (event.target instanceof Element && event.target.closest("button"))
      return;
    if (event.button !== 0) return;
    const element = viewport.current!;
    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
    element.setPointerCapture(event.pointerId);
    element.dataset.dragging = "true";
    gesture.current = {
      x: event.clientX,
      y: event.clientY,
      left: element.scrollLeft,
      top: element.scrollTop,
      distance: distance(),
      zoom: zoomRef.current,
    };
  }
  function moveGesture(event: PointerEvent<HTMLDivElement>) {
    if (!pointers.current.has(event.pointerId)) return;
    pointers.current.set(event.pointerId, {
      x: event.clientX,
      y: event.clientY,
    });
    if (pointers.current.size > 1 && gesture.current.distance > 0) {
      zoomRef.current = clampZoom(
        (gesture.current.zoom * distance()) / gesture.current.distance,
      );
      cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => setZoom(zoomRef.current));
    } else {
      viewport.current!.scrollLeft =
        gesture.current.left + gesture.current.x - event.clientX;
      viewport.current!.scrollTop =
        gesture.current.top + gesture.current.y - event.clientY;
    }
  }
  function endGesture(event: PointerEvent<HTMLDivElement>) {
    pointers.current.delete(event.pointerId);
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    const remaining = [...pointers.current.values()][0];
    if (!remaining) event.currentTarget.dataset.dragging = "false";
    if (remaining)
      gesture.current = {
        x: remaining.x,
        y: remaining.y,
        left: viewport.current!.scrollLeft,
        top: viewport.current!.scrollTop,
        distance: 0,
        zoom: zoomRef.current,
      };
  }
  return (
    <div className="image-preview">
      <div
        className="viewer-toolbar"
        role="group"
        aria-label="Image zoom controls"
      >
        <button
          className="icon-button"
          aria-label="Zoom out"
          disabled={zoom <= MIN_ZOOM}
          onClick={() => changeZoom(zoom / 1.25)}
        >
          <ZoomOut size={19} />
        </button>
        <output
          className="zoom-percentage"
          aria-label="Zoom level"
          aria-live="polite"
        >
          {Math.round(zoom * 100)}%
        </output>
        <button
          className="icon-button"
          aria-label="Zoom in"
          disabled={zoom >= MAX_ZOOM}
          onClick={() => changeZoom(zoom * 1.25)}
        >
          <ZoomIn size={19} />
        </button>
        <button className="zoom-fit-button" onClick={fitWidth}>
          Fit width
        </button>
        <button className="zoom-fit-button" onClick={fitImage}>
          Fit image
        </button>
      </div>
      <div
        ref={viewport}
        className="zoom-viewport"
        tabIndex={0}
        role="region"
        aria-label="Project image. Scroll or pinch to zoom; drag to explore."
        onDoubleClick={fitImage}
        onPointerDown={startGesture}
        onPointerMove={moveGesture}
        onPointerUp={endGesture}
        onPointerCancel={endGesture}
        onLostPointerCapture={endGesture}
        onKeyDown={(event) => {
          if (event.key === "+" || event.key === "=") {
            event.preventDefault();
            changeZoom(zoom * 1.25);
          }
          if (event.key === "-") {
            event.preventDefault();
            changeZoom(zoom / 1.25);
          }
          if (event.key === "0") {
            event.preventDefault();
            fitImage();
          }
        }}
      >
        <div
          className="zoom-canvas"
          style={{
            width: Math.max(size.width, width + 32),
            height: Math.max(size.height, height + 32),
          }}
        >
          <PerspectiveCarousel
            items={items}
            activeIndex={activeIndex}
            onActiveIndexChange={(next) => {
              onActiveIndexChange(next);
              requestAnimationFrame(() =>
                viewport.current?.focus({ preventScroll: true }),
              );
            }}
            slideWidth={width}
            slideHeight={height}
          />
        </div>
      </div>
      <p className="viewer-help">
        Scroll or pinch to zoom · Drag to explore · Double-click to fit · Esc to
        close
      </p>
    </div>
  );
}
