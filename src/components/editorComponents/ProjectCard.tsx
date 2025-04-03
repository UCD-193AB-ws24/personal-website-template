"use client";

import React, { useState, useEffect, useRef } from "react";
import { Rnd } from "react-rnd";
import { XIcon } from "lucide-react";

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
  updateComponent = () => {},
  isActive = true,
  onMouseDown: onMouseDown = () => {},
  setIsDragging = () => {},
  isPreview,
}: ProjectCardProps) {
  const [position, setPosition] = useState(initialPos);
  const [size, setSize] = useState(initialSize);
  const [cards, setCards] = useState<ProjectCardContent[]>([]);
  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const jsonContent = JSON.parse(content);
      if (Array.isArray(jsonContent)) {
        setCards(jsonContent);
      }
    } catch (e) {
      setCards([]);
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    const cardHeights = Object.values(cardRefs.current)
      .filter(Boolean)
      .map((el) => el!.offsetHeight);

    if (cardHeights.length === 0) return;

    const maxCardHeight = Math.max(...cardHeights);

    setSize((prev) => {
      if (maxCardHeight !== prev.height) {
        return { ...prev, height: maxCardHeight };
      }
      return prev;
    });
  }, [cards]);

  const updateContent = (newCards: ProjectCardContent[]) => {
    setCards(newCards);
    updateComponent(id, position, size, JSON.stringify(newCards));
  };

  const addCard = () => {
    if (cards.length < 3) {
      const newCard: ProjectCardContent = {
        id: Date.now(),
        title: "Section Title",
        body: "Body Text",
      };
      updateContent([...cards, newCard]);
    }
  };

  const deleteCard = (id: number) => {
    const updatedCards = cards.filter((card) => card.id !== id);
    updateContent(updatedCards);
  };

  const handleCardChange = (
    cardId: number,
    field: "title" | "body",
    value: string,
  ) => {
    const updatedCards = cards.map((card) =>
      card.id === cardId ? { ...card, [field]: value } : card,
    );
    updateContent(updatedCards);
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
          width: "calc(100vw - 16rem)",
          height: "max-content",
        }}
      >
        <div className="p-4 mx-auto">
          <div className="flex flex-wrap justify-center gap-4">
            {cards.map((card) => (
              <div
                key={card.id}
                className="w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 p-4 border rounded shadow bg-white"
              >
                <h2 className="text-center text-xl font-semibold p-0 m-0 leading-none break-words whitespace-pre-wrap">
                  {card.title}
                </h2>
                <p className="text-gray-700 mt-2 break-words whitespace-pre-wrap">
                  {card.body}
                </p>
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
      minWidth={"100%"}
      minHeight={Math.max(
        100,
        ...Object.values(cardRefs.current)
          .filter(Boolean)
          .map((el) => el!.offsetHeight + 32),
      )}
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
        setPosition(newPosition);
        handleResizeStop(id, components, updateComponent, setSize, setPosition)(
          e,
          d,
          ref,
          delta,
          newPosition,
        );
        const newHeight = ref.offsetHeight;
        setSize({ ...size, height: newHeight });
      }}
      bounds="parent"
      onMouseDown={handleMouseDown}
      style={{ pointerEvents: "auto" }}
      dragGrid={[GRID_SIZE, GRID_SIZE]}
      resizeGrid={[GRID_SIZE, GRID_SIZE]}
      enableResizing={{ top: true, right: false, bottom: true, left: false }}
    >
      <ActiveOutlineContainer isActive={isActive}>
        <div
          ref={containerRef}
          className="flex flex-col justify-between w-[calc(100vw - 16rem)] mx-auto p-4"
        >
          {cards.length < 3 && (
            <button
              onClick={addCard}
              disabled={cards.length >= 3}
              className="absolute top-2 right-4 px-3 py-1 bg-blue-600 text-white rounded text-sm shadow hover:bg-blue-700"
            >
              Add Card
            </button>
          )}
          <div className="flex flex-wrap justify-center items-stretch gap-4">
            {cards.map((card) => (
              <div
                key={card.id}
                ref={(el) => void (cardRefs.current[card.id] = el)}
                className="min-h-max relative w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 p-4 border rounded shadow bg-white flex flex-col transition-all duration-300 ease-in-out"
              >
                <button
                  onClick={() => deleteCard(card.id)}
                  className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                  aria-label="Delete Card"
                >
                  <XIcon size={18} />
                </button>
                <h2
                  contentEditable
                  suppressContentEditableWarning
                  draggable="false"
                  className="text-center text-2xl font-semibold cursor-text p-0 m-0 leading-none outline outline-gray-300 rounded-sm break-words whitespace-pre-wrap"
                  style={{
                    outline: `${!isActive ? "none" : ""}`,
                  }}
                  onBlur={(e) => {
                    handleCardChange(
                      card.id,
                      "title",
                      e.currentTarget.innerText,
                    );
                  }}
                >
                  {card.title}
                </h2>
                <p
                  contentEditable
                  suppressContentEditableWarning
                  draggable="false"
                  className="text-gray-700 mt-2 outline outline-gray-300 rounded-sm break-words whitespace-pre-wrap"
                  style={{
                    outline: `${!isActive ? "none" : ""}`,
                  }}
                  onBlur={(e) => {
                    handleCardChange(card.id, "body", e.target.innerText);
                  }}
                >
                  {card.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </ActiveOutlineContainer>
    </Rnd>
  );
}
