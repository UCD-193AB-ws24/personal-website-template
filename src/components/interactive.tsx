import { useState, cloneElement } from "react";
import useComponentVisibleInteractive from "@lib/hooks/useComponentVisibleInteractive"

// Required props for a valid child
export interface InteractiveChildProps {
  style?: React.CSSProperties,
}

interface InteractiveProps {
  child: React.ReactElement<InteractiveChildProps>
  widthPx?: number,
  heightPx?: number,
}

// Takes a child as a prop and makes it resizeable and draggable
export default function Interactive({ child, widthPx = 50, heightPx = 50 }: InteractiveProps) {
  const resizeBtnColor = "gray";
  const resizeBtnWidth = 8;
  const resizeBtnHeight = 8;

  const [mouseOffset, setMouseOffset] = useState({x: 0, y: 0});
  const [childPos, setChildPos] = useState({x: 0, y: 0});
  const [childSize, setChildSize] = useState({x: widthPx, y: heightPx});
  const [isSelected, setIsSelected] = useState(false);
  const [showResizeBtns, setShowResizeBtns] = useState(false);


  const handleClick = (e: React.MouseEvent) => {
    if (e.target === null) {
      return;
    }

    setIsSelected(true);
    setShowResizeBtns(true);
  }

  const handleClickOutside = () => {
    if (!isSelected) {
      setIsSelected(false);
      setShowResizeBtns(false);
    }
  }

  const ref = useComponentVisibleInteractive<HTMLDivElement>(handleClickOutside);

  const handleDragStart = (e: React.DragEvent) => {
    setIsSelected(true);
    setShowResizeBtns(false);
    if (e.target === null) {
      return;
    }
    const target = e.target as HTMLElement;

    const rect = target.getBoundingClientRect();

    setMouseOffset({x: rect.left - e.clientX, y: rect.top - e.clientY});
  }

  const handleDragEnd = (e: React.DragEvent) => {
    setIsSelected(true);
    setShowResizeBtns(true);
    e.preventDefault();
    if (e.target === null) {
      return;
    }

    setChildPos({x: e.clientX + mouseOffset.x, y: e.clientY + mouseOffset.y});
  }

  const handleResizeHoriz1D = (e: React.MouseEvent) => {
    if (e.target === null) {
      return;
    }

    const centerPointX = childPos.x + (childSize.x / 2)

    // startPointX is the x value of the child's left or right side
    const startSideX = e.clientX;

    // oppSideX is the midpoint of the side opposite of startSideX
    let oppSideX = childPos.x + childSize.x

    if (startSideX > centerPointX) {
      // Change oppSideX to be the x value of the child's left edge
      oppSideX = childPos.x
    }

    const handleResizeMove = (e: MouseEvent) => {
      const currentPosX = e.clientX;
      let newPosX = oppSideX;
      let newSizeX = 0;

      if ((oppSideX - startSideX) * (oppSideX - currentPosX) > 0) {
        if (startSideX <= centerPointX) {
          // Checks if the side selected for resizing is to the left of the center point
          // i.e. Expanding left is allowed
          // Since positions are given by the top left corner, the x position should only be
          // updated if dragging the corner allows resizing left
          newPosX = currentPosX;
        }
        newSizeX = Math.abs(oppSideX - currentPosX);
      }
      setChildPos({x: newPosX, y: childPos.y})
      setChildSize({x: newSizeX, y: childSize.y})
    }

    const handleResizeEnd = (_e: MouseEvent) => {
      document.removeEventListener("mousemove", handleResizeMove);
    }

    document.addEventListener("mousemove", handleResizeMove);
    document.addEventListener("mouseup", handleResizeEnd, {once: true});
  }

  const handleResizeVert1D = (e: React.MouseEvent) => {
    if (e.target === null) {
      return;
    }

    const centerPointY = childPos.y + (childSize.y / 2)

    // startPointY is the y value of the child's top or bottom side
    const startSideY = e.clientY;

    // oppSideY is the midpoint of the side opposite of startSideY
    let oppSideY = childPos.y + childSize.y

    if (startSideY > centerPointY) {
      // Change oppSideY to be the y value of the child's top edge
      oppSideY = childPos.y
    }

    const handleResizeMove = (e: MouseEvent) => {
      const currentPosY = e.clientY;
      let newPosY = oppSideY;
      let newSizeY = 0;

      if ((oppSideY - startSideY) * (oppSideY - currentPosY) > 0) {
        if (startSideY <= centerPointY) {
          // Checks if the side selected for resizing is above the center point
          // i.e. Expanding up is allowed
          // Since positions are given by the top left corner, the y position should only be
          // updated if dragging the corner allows resizing up
          newPosY = currentPosY;
        }

        newSizeY = Math.abs(oppSideY - currentPosY);
      }
      setChildPos({x: childPos.x, y: newPosY})
      setChildSize({x: childSize.x, y: newSizeY})
    }

    const handleResizeEnd = (_e: MouseEvent) => {
      document.removeEventListener("mousemove", handleResizeMove);
    }

    document.addEventListener("mousemove", handleResizeMove);
    document.addEventListener("mouseup", handleResizeEnd, {once: true});
  }

  const handleResize2D = (e: React.MouseEvent) => {
    if (e.target === null) {
      return;
    }
    
    const centerPoint = {x: childPos.x + (childSize.x / 2), y: childPos.y + (childSize.y / 2)}

    // startPoint is one of the child's corner points
    const startPoint = {x: e.clientX, y: e.clientY};

    // oppCornerPoint is on the opposite corner of startPoint
    // ex: if startPoint is the top left corner, then oppCornerPoint is the bottom right corner
    const oppCornerPoint = {x: childPos.x + childSize.x, y: childPos.y + childSize.y}

    if (startPoint.x > centerPoint.x) {
      // Change oppCornerPoint's x position to be the x value of the child's left edge
      oppCornerPoint.x = childPos.x
    }
    if (startPoint.y > centerPoint.y) {
      // Change oppCornerPoint's y position to be the y value of the child's top edge
      oppCornerPoint.y = childPos.y
    }

    const handleResizeMove = (e: MouseEvent) => {
      const currentPos = {x: e.clientX, y: e.clientY}

      const newPos = {x: oppCornerPoint.x, y: oppCornerPoint.y}
      const newSize = {x: 0, y: 0}

      // Only resize horizontally if the mouse's position doesn't cross over the
      // opposite horizontal side
      if ((oppCornerPoint.x - startPoint.x) * (oppCornerPoint.x - currentPos.x) > 0) {
        if (startPoint.x <= centerPoint.x) {
          // Checks if the corner selected for resizing is to the left of the center point
          // i.e. Expanding left is allowed
          // Since positions are given by the top left corner, the x position should only be
          // updated if dragging the corner allows resizing left
          newPos.x = currentPos.x;
        }
        newSize.x = Math.abs(oppCornerPoint.x - currentPos.x);
      }

      // Only resize vertically if the mouse's position is doesn't cross over the
      // opposite vertical side
      if ((oppCornerPoint.y - startPoint.y) * (oppCornerPoint.y - currentPos.y) > 0) {
        if (startPoint.y <= centerPoint.y) {
          // Checks if the corner selected for resizing is above the center point
          // i.e. Expanding up is allowed
          // Since positions are given by the top left corner, the y position should only be
          // updated if dragging the corner allows resizing up
          newPos.y = currentPos.y;
        }

        newSize.y = Math.abs(oppCornerPoint.y - currentPos.y);
      }
      setChildPos(newPos)
      setChildSize(newSize)
    }

    const handleResizeEnd = (_e: MouseEvent) => {
      document.removeEventListener("mousemove", handleResizeMove);
    }

    document.addEventListener("mousemove", handleResizeMove);
    document.addEventListener("mouseup", handleResizeEnd, {once: true});
  }

  return (
    <div
      ref={ref}
      style={{width: `${childSize.x}px`, height: `${childSize.y}px`, position: "fixed", left: `${childPos.x}px`, top: `${childPos.y}px`}}
      onMouseDown={handleClick}
    >
      <button
        id="nw-resize"
        style={{border: "none", borderRadius: "50%", width: `${resizeBtnWidth}px`, height: `${resizeBtnHeight}px`, position: "absolute", left: "-3.5px", top: "-3.5px", backgroundColor: `${resizeBtnColor}`, cursor: "nw-resize", zIndex: "10"}}
        onMouseDown={handleResize2D}
        hidden={!isSelected || !showResizeBtns}
      ></button>
      <button
        id="n-resize"
        style={{border: "none", borderRadius: "50%", width: `${resizeBtnWidth}px`, height: `${resizeBtnHeight}px`, position: "absolute", left: `${(childSize.x / 2) - 4}px`, top: "-3.5px", backgroundColor: `${resizeBtnColor}`, cursor: "n-resize", zIndex: "10"}}
        onMouseDown={handleResizeVert1D}
        hidden={!isSelected || !showResizeBtns}
      ></button>
      <button
        id="ne-resize"
        style={{border: "none", borderRadius: "50%", width: `${resizeBtnWidth}px`, height: `${resizeBtnHeight}px`, position: "absolute", right: "-3.5px", top: "-3.5px", backgroundColor: `${resizeBtnColor}`, cursor: "ne-resize", zIndex: "10"}}
        onMouseDown={handleResize2D}
        hidden={!isSelected || !showResizeBtns}
      ></button>
      <button
        id="e-resize"
        style={{border: "none", borderRadius: "50%", width: `${resizeBtnWidth}px`, height: `${resizeBtnHeight}px`, position: "absolute", right: "-3.5px", top: `${(childSize.y / 2) - 4}px`, backgroundColor: `${resizeBtnColor}`, cursor: "e-resize", zIndex: "10"}}
        onMouseDown={handleResizeHoriz1D}
        hidden={!isSelected || !showResizeBtns}
      ></button>
      <button
        id="se-resize"
        style={{border: "none", borderRadius: "50%", width: `${resizeBtnWidth}px`, height: `${resizeBtnHeight}px`, position: "absolute", right: "-3.5px", bottom: "-3.5px", backgroundColor: `${resizeBtnColor}`, cursor: "se-resize", zIndex: "10"}}
        onMouseDown={handleResize2D}
        hidden={!isSelected || !showResizeBtns}
      ></button>
      <button
        id="s-resize"
        style={{border: "none", borderRadius: "50%", width: `${resizeBtnWidth}px`, height: `${resizeBtnHeight}px`, position: "absolute", left: `${(childSize.x / 2) - 4}px`, bottom: "-3.5px", backgroundColor: `${resizeBtnColor}`, cursor: "s-resize", zIndex: "10"}}
        onMouseDown={handleResizeVert1D}
        hidden={!isSelected || !showResizeBtns}
      ></button>
      <button
        id="sw-resize"
        style={{border: "none", borderRadius: "50%", width: `${resizeBtnWidth}px`, height: `${resizeBtnHeight}px`, position: "absolute", left: "-3.5px", bottom: "-3.5px", backgroundColor: `${resizeBtnColor}`, cursor: "sw-resize", zIndex: "10"}}
        onMouseDown={handleResize2D}
        hidden={!isSelected || !showResizeBtns}
      ></button>
      <button
        id="w-resize"
        style={{border: "none", borderRadius: "50%", width: `${resizeBtnWidth}px`, height: `${resizeBtnHeight}px`, position: "absolute", left: "-3.5px", top: `${(childSize.y / 2) - 4}px`, backgroundColor: `${resizeBtnColor}`, cursor: "w-resize", zIndex: "10"}}
        onMouseDown={handleResizeHoriz1D}
        hidden={!isSelected || !showResizeBtns}
      ></button>

      <div style={{border: `${isSelected ? "1px solid blue" : "1px solid transparent"}`, width: "100%", height: "100%", display: "flex"}} draggable="true" onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        {/* Recreate the child with new styling to make it take up the parent's entire width and height */}
        { cloneElement(child, {
          style: {
            ...child.props.style,
            width: "100%",  // Override width
            height: "100%",  // Override height
          }
        }) }
      </div>
    </div>
  );
}