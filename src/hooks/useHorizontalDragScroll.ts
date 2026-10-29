import { useEffect, useRef, useState, type MouseEvent } from "react";

/** Pan an overflow viewport without turning ordinary clicks into drags. */
export function useHorizontalDragScroll() {
  const ref = useRef<HTMLDivElement>(null);
  const gesture = useRef<{ id: number; x: number; y: number; scroll: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const move = (event: PointerEvent) => {
      const start = gesture.current;
      const viewport = ref.current;
      if (!start || !viewport || event.pointerId !== start.id) return;
      const dx = event.clientX - start.x;
      const dy = event.clientY - start.y;
      if (!start.moved) {
        if (Math.abs(dx) < 6 || Math.abs(dx) <= Math.abs(dy)) return;
        start.moved = true;
        suppressClick.current = true;
        viewport.setPointerCapture?.(event.pointerId);
        setDragging(true);
      }
      event.preventDefault();
      viewport.scrollLeft = start.scroll - dx;
    };
    const end = (event: PointerEvent) => {
      if (gesture.current?.id !== event.pointerId) return;
      gesture.current = null;
      setDragging(false);
      if (ref.current?.hasPointerCapture?.(event.pointerId)) {
        ref.current.releasePointerCapture(event.pointerId);
      }
    };
    window.addEventListener("pointermove", move, { passive: false });
    window.addEventListener("pointerup", end);
    window.addEventListener("pointercancel", end);
    window.addEventListener("blur", cancel);
    function cancel() { gesture.current = null; setDragging(false); }
    return () => {
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerup", end);
      window.removeEventListener("pointercancel", end);
      window.removeEventListener("blur", cancel);
    };
  }, []);

  return {
    ref,
    className: dragging ? "cursor-grabbing select-none" : "cursor-grab",
    onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => {
      suppressClick.current = false;
      const viewport = ref.current;
      if (!viewport || event.button !== 0 || event.pointerType === "touch" || viewport.scrollWidth <= viewport.clientWidth) return;
      if (event.target instanceof Element && event.target.closest("button, a, input, textarea, select, [role='tab'], [contenteditable='true'], [draggable='true']")) return;
      gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY, scroll: viewport.scrollLeft, moved: false };
    },
    onClickCapture: (event: MouseEvent<HTMLDivElement>) => {
      if (!suppressClick.current || event.detail === 0) return;
      suppressClick.current = false;
      event.preventDefault();
      event.stopPropagation();
    },
  };
}