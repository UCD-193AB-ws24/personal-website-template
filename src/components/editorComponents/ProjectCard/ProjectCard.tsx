/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Rnd } from "react-rnd";
import { useSearchParams } from "next/navigation";
import { XIcon } from "lucide-react";

import ActiveOutlineContainer from "@components/editorComponents/ActiveOutlineContainer";
import ImageCard from "./ImageCard";

import type {
  ComponentItem,
  Position,
  Size,
} from "@customTypes/componentTypes";

import { handleDragStop, handleResizeStop } from "@utils/dragResizeUtils";
import { GRID_SIZE } from "@utils/constants";
import useIsMobile from "@lib/hooks/useIsMobile";

interface ProjectCardContent {
  id: number;
  type: "text" | "image";
  title?: string;
  body?: string;
  imageUrl?: string;
  widthPercent?: number;
  positionPercent?: { x: number; y: number };
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
  isMobilePreview?: boolean;
  isPublish?: boolean;
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
  isMobilePreview = false,
  isPublish = false,
}: ProjectCardProps) {
  const [position, setPosition] = useState(initialPos);
  const [size, setSize] = useState(initialSize);
  const [minHeight, setMinHeight] = useState(initialSize.height);
  const [cards, setCards] = useState<ProjectCardContent[]>([]);
  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const [previewSrcs, setPreviewSrcs] = useState<Record<number, string>>({});
  const isMobile = useIsMobile();

  const draftNumber = useSearchParams().get("draftNumber");


  useEffect(() => {
    if (!containerRef.current) return;

    // Get all non-image card DOM nodes
    const nonImageCardHeights = Object.entries(cardRefs.current)
      .filter(([cardId]) => {
        const matchingCard = cards.find((card) => card.id.toString() === cardId);
        return matchingCard && matchingCard.type !== "image";
      })
      .map(([_, ref]) => ref?.offsetHeight || 0);

    const contentHeight = Math.max(...nonImageCardHeights, 0);

    if (contentHeight > size.height) {
      setSize((prev) => ({ ...prev, height: contentHeight }));
    }
    setMinHeight(contentHeight + 32); // 32 for top and bottom padding

  }, [cards, size.height]);



  useEffect(() => {
    try {
      const jsonContent = JSON.parse(content);
      if (Array.isArray(jsonContent)) {
        setCards(jsonContent);
      }
    } catch {
      setCards([]);
    }
  }, [content]);

  const updateContent = (newCards: ProjectCardContent[]) => {
    setCards(newCards);
    updateComponent(id, position, size, JSON.stringify(newCards));
  };

  const addTextCard = () => {
    if (cards.length < 3) {
      const newCard: ProjectCardContent = {
        id: Date.now(),
        type: "text",
        title: "Section Title",
        body: "Body Text",
      };
      updateContent([...cards, newCard]);
    }
  };

  const addImageCard = () => {
    if (cards.length < 3) {
      const newCard: ProjectCardContent = {
        id: Date.now(),
        type: "image",
        imageUrl: "",
      };
      updateContent([...cards, newCard]);
    }
  };

  const deleteCard = (id: number) => {
    const updatedCards = cards.filter((card) => card.id !== id);
    updateContent(updatedCards);
  };

  const handleTextCardChange = (
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

  if (isPreview || isPublish) {
    return (
      <div
        style={{
          position: isPreview ? "absolute" : "relative",
          left: 0,
          top: position.y,
          width: isMobilePreview
            ? "100%"
            : isMobile
              ? "calc(100vw - 2rem)"
              : "calc(100vw - 16rem)",
          height: "max-content",
        }}
      >
        <div className="p-4 mx-auto">
          <div className="flex flex-wrap justify-center gap-4">
            {cards.map((card) => (
              <div
                key={card.id}
                className={`relative ${
                    isMobilePreview
                      ? "w-full"
                      : "w-full sm:w-1/2 lg:w-1/3 xl:w-1/4"
                  } flex flex-col border
                  ${card.type === "image" ? "border-none" : "h-fit bg-white rounded shadow"}`}
              >
                {card.type === "image" ? (
                  <div
                    style={{
                      position: "relative",
                      width: `${card.widthPercent}%`,
                      left: `${card.positionPercent?.x}%`,
                      top: `${card.positionPercent?.y}%`,
                    }}
                    className="h-auto"
                  >
                    <div className="w-full h-full flex items-center justify-center cursor-pointer bg-gray-200">
                      {card.imageUrl ? (
                        <img
                          src={card.imageUrl}
                          alt="Uploaded"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          No Image
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="p-4">
                    <h2 className="text-center text-xl font-semibold p-0 m-0 leading-none break-words whitespace-pre-wrap">
                      {card.title}
                    </h2>
                    <p className="text-gray-700 mt-2 break-words whitespace-pre-wrap">
                      {card.body}
                    </p>
                  </div>
                )}
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
      minHeight={minHeight}
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
          className="flex flex-col justify-between w-[calc(100vw - 16rem)] h-full mx-auto p-4"
        >
          {isActive && cards.length < 3 && (
            <>
              <button
                onClick={addTextCard}
                className="absolute top-2 right-4 px-3 py-1 bg-blue-600 text-white rounded text-sm shadow hover:bg-blue-700"
              >
                Add Text Card
              </button>
              <button
                onClick={addImageCard}
                className="absolute top-10 right-4 px-3 py-1 bg-green-600 text-white rounded text-sm shadow hover:bg-green-700"
              >
                Add Image Card
              </button>
            </>
          )}

          <div className="flex flex-wrap justify-center h-full items-stretch gap-4">
            {cards.map((card) => (
              <div
                key={card.id}
                ref={(el) => void (cardRefs.current[card.id] = el)}
                className={`relative ${
                    isMobilePreview
                      ? "w-full"
                      : "w-full sm:w-1/2 lg:w-1/3 xl:w-1/4"
                  } flex flex-col border
                  ${card.type === "image" && isActive ? "border-gray-300" : "border-transparent"}
                  ${card.type === "image" ? "h-full" : "h-fit bg-white rounded shadow"}`}
              >
                {isActive && (
                  <button
                    onClick={() => deleteCard(card.id)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 z-10"
                    aria-label="Delete Card"
                  >
                    <XIcon size={18} />
                  </button>
                )}

                {card.type === "image" ? (
                  <ImageCard
                    key={card.id}
                    cardId={card.id}
                    imageUrl={card.imageUrl}
                    previewSrc={previewSrcs[card.id]}
                    draftNumber={draftNumber}
                    onImageUpload={(id, url) => {
                      const updated = cards.map(c => c.id === id ? { ...c, imageUrl: url } : c);
                      updateContent(updated);
                    }}
                    setPreviewSrc={(id, url) => {
                      setPreviewSrcs(prev => {
                        if (prev[id]) URL.revokeObjectURL(prev[id]);
                        const updated = { ...prev };
                        if (url) updated[id] = url;
                        else delete updated[id];
                        return updated;
                      });
                    }}
                    isActive={isActive}
                    widthPercent={card.widthPercent}
                    positionPercent={card.positionPercent}
                    onLayoutChange={(cardId, layout) => {
                      const current = cards.find((c) => c.id === cardId);
                      if (
                        current &&
                        (current.widthPercent !== layout.widthPercent ||
                          current.positionPercent?.x !== layout.positionPercent.x ||
                          current.positionPercent?.y !== layout.positionPercent.y)
                      ) {
                        const updated = cards.map((c) =>
                          c.id === cardId ? { ...c, ...layout } : c
                        );
                        updateContent(updated);
                      }
                    }}
                  />
                ) : (
                  <div className="p-4">
                    <h2
                      contentEditable
                      suppressContentEditableWarning
                      draggable="false"
                      className="text-center text-2xl font-semibold cursor-text p-0 m-0 leading-none outline outline-gray-300 rounded-sm break-words whitespace-pre-wrap"
                      style={{
                        outline: `${!isActive ? "none" : ""}`,
                      }}
                      onBlur={(e) => {
                        handleTextCardChange(
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
                        handleTextCardChange(card.id, "body", e.target.innerText);
                      }}
                    >
                      {card.body}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </ActiveOutlineContainer>
    </Rnd>
  );
}
