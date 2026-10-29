import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { useHorizontalDragScroll } from "@/hooks/useHorizontalDragScroll";

function Harness({ onClick }: { onClick: () => void }) {
  const scroll = useHorizontalDragScroll();
  return <div {...scroll} data-testid="viewport"><div onClick={onClick}>Record</div><button>Action</button></div>;
}

function setup() {
  const onClick = vi.fn();
  render(<Harness onClick={onClick} />);
  const viewport = screen.getByTestId("viewport");
  Object.defineProperties(viewport, { scrollWidth: { value: 1600 }, clientWidth: { value: 800 } });
  const pointer = (target: EventTarget, type: string, x: number, y = 20, pointerType = "mouse") => {
    const event = new Event(type, { bubbles: true, cancelable: true });
    Object.assign(event, { pointerId: 1, button: 0, clientX: x, clientY: y, pointerType });
    fireEvent(target, event);
  };
  return { viewport, pointer, onClick };
}

describe("horizontal viewport dragging", () => {
  it("scrolls sideways without opening the dragged record", () => {
    const { viewport, pointer, onClick } = setup();
    pointer(screen.getByText("Record"), "pointerdown", 300);
    pointer(window, "pointermove", 180);
    expect(viewport.scrollLeft).toBe(120);
    pointer(window, "pointerup", 180);
    fireEvent.click(screen.getByText("Record"), { detail: 1 });
    expect(onClick).not.toHaveBeenCalled();
  });

  it("preserves ordinary record clicks", () => {
    const { viewport, pointer, onClick } = setup();
    pointer(screen.getByText("Record"), "pointerdown", 300);
    pointer(window, "pointermove", 297);
    pointer(window, "pointerup", 297);
    fireEvent.click(screen.getByText("Record"), { detail: 1 });
    expect(onClick).toHaveBeenCalledOnce();
    expect(viewport.scrollLeft).toBe(0);
  });

  it("does not pan when using a button", () => {
    const { viewport, pointer } = setup();
    pointer(screen.getByRole("button"), "pointerdown", 300);
    pointer(window, "pointermove", 180);
    expect(viewport.scrollLeft).toBe(0);
  });

  it("leaves touch and vertical scrolling native", () => {
    const { viewport, pointer } = setup();
    pointer(viewport, "pointerdown", 300, 20, "touch");
    pointer(window, "pointermove", 180, 20, "touch");
    expect(viewport.scrollLeft).toBe(0);
    pointer(window, "pointerup", 180);
    pointer(viewport, "pointerdown", 300);
    pointer(window, "pointermove", 290, 100);
    expect(viewport.scrollLeft).toBe(0);
  });
});