'use client';

import { useState } from "react";

export default function Textbox() {
  const resizeBtnColor = "gray";
  const resizeBtnWidth = 8;
  const resizeBtnHeight = 8;

  const [mouseOffset, setMouseOffset] = useState({x: 0, y: 0})
  const [textboxPos, setTextboxPos] = useState({x: 0, y: 0})
  const [textboxSize, setTextboxSize] = useState({x: 170, y: 28})

  const handleDragStart = (e: React.DragEvent) => {
    if (e.target === null) {
      return;
    }

    const target = e.target as HTMLElement;
    const rect = target.getBoundingClientRect();

    setMouseOffset({x: rect.left - e.clientX, y: rect.top - e.clientY});
  }

  const handleDragEnd = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.target === null) {
      return;
    }

    setTextboxPos({x: e.clientX + mouseOffset.x, y: e.clientY + mouseOffset.y});
  }

  const handleResizeHoriz1D = (e: React.MouseEvent) => {
    if (e.target === null) {
      return;
    }

    const centerPointX = textboxPos.x + (textboxSize.x / 2)

    // startPointX is the x value of the textbox's left or right side
    const startSideX = e.clientX;

    // oppSideX is the midpoint of the side opposite of startSideX
    let oppSideX = textboxPos.x + textboxSize.x

    if (startSideX > centerPointX) {
      // Change oppSideX to be the x value of the textbox's left edge
      oppSideX = textboxPos.x
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
      setTextboxPos({x: newPosX, y: textboxPos.y})
      setTextboxSize({x: newSizeX, y: textboxSize.y})
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

    const centerPointY = textboxPos.y + (textboxSize.y / 2)

    // startPointY is the y value of the textbox's top or bottom side
    const startSideY = e.clientY;

    // oppSideY is the midpoint of the side opposite of startSideY
    let oppSideY = textboxPos.y + textboxSize.y

    if (startSideY > centerPointY) {
      // Change oppSideY to be the y value of the textbox's top edge
      oppSideY = textboxPos.y
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
      setTextboxPos({x: textboxPos.x, y: newPosY})
      setTextboxSize({x: textboxSize.x, y: newSizeY})
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
    
    const centerPoint = {x: textboxPos.x + (textboxSize.x / 2), y: textboxPos.y + (textboxSize.y / 2)}

    // startPoint is one of the textbox's corner points
    const startPoint = {x: e.clientX, y: e.clientY};

    // oppCornerPoint is on the opposite corner of startPoint
    // ex: if startPoint is the top left corner, then oppCornerPoint is the bottom right corner
    const oppCornerPoint = {x: textboxPos.x + textboxSize.x, y: textboxPos.y + textboxSize.y}

    if (startPoint.x > centerPoint.x) {
      // Change oppCornerPoint's x position to be the x value of the textbox's left edge
      oppCornerPoint.x = textboxPos.x
    }
    if (startPoint.y > centerPoint.y) {
      // Change oppCornerPoint's y position to be the y value of the textbox's top edge
      oppCornerPoint.y = textboxPos.y
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
      setTextboxPos(newPos)
      setTextboxSize(newSize)
    }

    const handleResizeEnd = (_e: MouseEvent) => {
      document.removeEventListener("mousemove", handleResizeMove);
    }

    document.addEventListener("mousemove", handleResizeMove);
    document.addEventListener("mouseup", handleResizeEnd, {once: true});
  }

  return (
    <div style={{width: textboxSize.x, height: textboxSize.y, position: "fixed", left: `${textboxPos.x}px`, top: `${textboxPos.y}px`}}>
        <button
          id="nw-resize"
          style={{border: "none", borderRadius: "50%", width: `${resizeBtnWidth}px`, height: `${resizeBtnHeight}px`, position: "absolute", left: "-3px", top: "-3.5px", backgroundColor: `${resizeBtnColor}`, cursor: "nw-resize", zIndex: "10"}}
          onMouseDown={handleResize2D}
        ></button>
        <button
          id="n-resize"
          style={{border: "none", borderRadius: "50%", width: `${resizeBtnWidth}px`, height: `${resizeBtnHeight}px`, position: "absolute", left: `${(textboxSize.x / 2) - 4}px`, top: "-3.5px", backgroundColor: `${resizeBtnColor}`, cursor: "n-resize", zIndex: "10"}}
          onMouseDown={handleResizeVert1D}
        ></button>
        <button
          id="ne-resize"
          style={{border: "none", borderRadius: "50%", width: `${resizeBtnWidth}px`, height: `${resizeBtnHeight}px`, position: "absolute", right: "-3px", top: "-3.5px", backgroundColor: `${resizeBtnColor}`, cursor: "ne-resize", zIndex: "10"}}
          onMouseDown={handleResize2D}
        ></button>
        <button
          id="e-resize"
          style={{border: "none", borderRadius: "50%", width: `${resizeBtnWidth}px`, height: `${resizeBtnHeight}px`, position: "absolute", right: "-3px", top: `${(textboxSize.y / 2) - 3.5}px`, backgroundColor: `${resizeBtnColor}`, cursor: "e-resize", zIndex: "10"}}
          onMouseDown={handleResizeHoriz1D}
        ></button>
        <button
          id="se-resize"
          style={{border: "none", borderRadius: "50%", width: `${resizeBtnWidth}px`, height: `${resizeBtnHeight}px`, position: "absolute", right: "-3px", bottom: "-3.5px", backgroundColor: `${resizeBtnColor}`, cursor: "se-resize", zIndex: "10"}}
          onMouseDown={handleResize2D}
        ></button>
        <button
          id="s-resize"
          style={{border: "none", borderRadius: "50%", width: `${resizeBtnWidth}px`, height: `${resizeBtnHeight}px`, position: "absolute", left: `${(textboxSize.x / 2) - 4}px`, bottom: "-3.5px", backgroundColor: `${resizeBtnColor}`, cursor: "s-resize", zIndex: "10"}}
          onMouseDown={handleResizeVert1D}
        ></button>
        <button
          id="sw-resize"
          style={{border: "none", borderRadius: "50%", width: `${resizeBtnWidth}px`, height: `${resizeBtnHeight}px`, position: "absolute", left: "-3px", bottom: "-3.5px", backgroundColor: `${resizeBtnColor}`, cursor: "sw-resize", zIndex: "10"}}
          onMouseDown={handleResize2D}
        ></button>
        <button
          id="w-resize"
          style={{border: "none", borderRadius: "50%", width: `${resizeBtnWidth}px`, height: `${resizeBtnHeight}px`, position: "absolute", left: "-3px", top: `${(textboxSize.y / 2) - 3.5}px`, backgroundColor: `${resizeBtnColor}`, cursor: "w-resize", zIndex: "10"}}
          onMouseDown={handleResizeHoriz1D}
        ></button>
        <textarea style={{resize: "none", width: textboxSize.x, height: textboxSize.y, border: "2px solid black", position: "fixed", textAlign: "start"}} draggable="true" onDragStart={handleDragStart} onDragEnd={handleDragEnd}></textarea>
    </div>
  );
}