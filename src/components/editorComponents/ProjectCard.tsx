'use client';

import React, { useState } from 'react';
import { Rnd } from "react-rnd";

import ActiveOutlineContainer from "@components/editorComponents/ActiveOutlineContainer";

import type {
  ComponentItem,
  Position,
  Size,
} from "@customTypes/componentTypes";

import { handleDragStop, handleResizeStop } from "@utils/dragResizeUtils";
import { GRID_SIZE } from "@utils/constants";

interface ProjectCardContent {
  id: number;
  title: string;
  body: string;
}

interface ProjectCardProps {
  id?: string;
  initialPos?: Position;
  initialSize?: Size;
  components?: ComponentItem[];
  content?: any;
  updateComponent?: (
    id: string,
    newPos: Position,
    newSize: Size,
    content?: any,
  ) => void;
  isActive?: boolean;
  onMouseDown?: () => void;
  setIsDragging?: (dragging: boolean) => void;
  isPreview?: boolean;
}

export default function ProjectCard({
  id = "",
  initialPos = { x: 0, y: -1 },
  initialSize = { width: 200, height: 100 },
  components = [],
  content = "",
  updateComponent = () => { },
  isActive = true,
  onMouseDown: onMouseDown = () => { },
  setIsDragging = () => { },
  isPreview,
}: ProjectCardProps) {
  const [position, setPosition] = useState(initialPos);
  const [size, setSize] = useState(initialSize);
  const [cards, setCards] = useState<ProjectCardContent[]>([]);

  const addCard = () => {
    if (cards.length < 3) {
      const newCard: ProjectCardContent = {
        id: Date.now(),
        title: `Section Title ${cards.length + 1}`,
        body: `This is the body text for card ${cards.length + 1}.`
      };
      setCards([...cards, newCard]);
    }
  };

  const deleteCard = (id: number) => {
    setCards(cards.filter((card) => card.id !== id));
  };

  const handleMouseDown = (e: React.MouseEvent | MouseEvent) => {
    e.stopPropagation();
    onMouseDown?.();
  };

  if (isPreview) {
    return (
      <div
        style={{
          position: "absolute",
          left: 0,
          top: position.y,
          width: "100%",
          height: size.height,
        }}
      >
        <div className="p-4 max-w-5xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Card Container</h1>
          <div className="flex flex-wrap justify-center gap-4">
            {cards.map((card) => (
              <div
                key={card.id}
                className="w-72 p-4 border rounded shadow bg-white"
              >
                <h2 className="text-xl font-semibold">{card.title}</h2>
                <p className="text-gray-700 mt-2">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* Editor Mode */
  return (
    <Rnd
      size={{ width: "100%", height: size.height }}
      position={{ x: 0, y: position.y }}
      onDragStart={() => setIsDragging(true)}
      onDragStop={(e, d) => {
        setIsDragging(false);
        handleDragStop(
          id,
          size,
          components,
          updateComponent,
          setPosition,
        )(e, d);
      }}
      onResizeStart={() => setIsDragging(true)}
      onResizeStop={(e, d, ref, delta, newPosition) => {
        setIsDragging(false);
        handleResizeStop(id, components, updateComponent, setSize, setPosition)(
          e,
          d,
          ref,
          delta,
          newPosition,
        );
      }}
      minWidth={"100%"}
      minHeight={100}
      bounds="parent"
      onMouseDown={handleMouseDown}
      style={{ pointerEvents: "auto" }}
      dragGrid={[GRID_SIZE, GRID_SIZE]}
      resizeGrid={[GRID_SIZE, GRID_SIZE]}
      enableResizing={{ top: true, right: false, bottom: true, left: false }}
    >
      <ActiveOutlineContainer isActive={isActive}>
        <div className="p-4 max-w-5xl mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Card Container</h1>

          <button
            onClick={addCard}
            disabled={cards.length >= 3}
            className="mb-6 px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
          >
            Add Card
          </button>

          <div className="flex flex-wrap justify-center gap-4">
            {cards.map((card) => (
              <div
                key={card.id}
                className="w-72 p-4 border rounded shadow bg-white"
              >
                <button
                  onClick={() => deleteCard(card.id)}
                  className="relative top-2 right-2 text-red-500 hover:text-red-700 text-sm"
                  aria-label="Delete Card"
                >
                  ✕
                </button>
                <h2 className="text-xl font-semibold">{card.title}</h2>
                <p className="text-gray-700 mt-2">{card.body}</p>
              </div>
            ))}
          </div>
        </div>
      </ActiveOutlineContainer>
    </Rnd>
  );
}
