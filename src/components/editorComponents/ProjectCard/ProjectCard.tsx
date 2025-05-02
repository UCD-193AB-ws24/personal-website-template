/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, useEffect, useRef } from "react";
import { Rnd } from "react-rnd";
import { useSearchParams } from "next/navigation";
import { ArrowLeftToLine, ArrowRightToLine, XIcon } from "lucide-react";

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

import RichTextbox from "@components/RichText/RichTextbox";
import RichTextToolbarPlugin from "@components/RichText/Plugins/RichTextToolbar";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import {
  RichTextInitialConfig,
  RichTextDefaultContent,
  HeaderRichTextDefaultContent,
} from "@components/RichText/RichTextSettings";

interface ProjectCardContent {
  id: number;
  type: "text" | "image";
  title?: any;
  body?: any;
  imageUrl?: string;
  widthPercent?: number;
  positionPercent?: { x: number; y: number };
  backgroundColor?: string;
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
  isDragOverlay?: boolean;
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
  isPreview = false,
  isMobilePreview = false,
  isPublish = false,
  isDragOverlay = false,
}: ProjectCardProps) {
  const [position, setPosition] = useState(initialPos);
  const [size, setSize] = useState(initialSize);
  const [minHeight, setMinHeight] = useState(initialSize.height);
  const [cards, setCards] = useState<ProjectCardContent[]>([]);
  const cardRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const [previewSrcs, setPreviewSrcs] = useState<Record<number, string>>({});
  const isMobile = useIsMobile();
  const [showOverlay, setShowOverlay] = useState(false);
  const [selectedTitleCardId, setSelectedTitleCardId] = useState<number | null>(
    null,
  );
  const [selectedBodyCardId, setSelectedBodyCardId] = useState<number | null>(
    null,
  );

  const draftNumber = useSearchParams().get("draftNumber");

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Check if the click is outside any card container
      if (!containerRef.current?.contains(e.target as Node)) {
        setSelectedTitleCardId(null);
        setSelectedBodyCardId(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    // Get all non-image card DOM nodes
    const nonImageCardHeights = Object.entries(cardRefs.current)
      .filter(([cardId]) => {
        const matchingCard = cards.find(
          (card) => card.id.toString() === cardId,
        );
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

  const updateCardBackgroundColor = (
    cardId: number,
    field: "title" | "body",
    newColor: string,
  ) => {
    const updatedCards = cards.map((card) => {
      if (card.id !== cardId) return card;
      const targetField = card[field];
      return {
        ...card,
        [field]: {
          ...(typeof targetField === "string"
            ? { textboxState: targetField }
            : targetField),
          backgroundColor: newColor,
        },
      };
    });
    updateContent(updatedCards);
  };

  const addTextCard = () => {
    if (cards.length < 3) {
      const newCard: ProjectCardContent = {
        id: Date.now(),
        type: "text",
        title: {
          textboxState:
            '{"root":{"children":[{"children":[{"detail":0,"format":1,"mode":"normal","style":"","text":"Section Title","type":"text","version":1}],"direction":"ltr","format":"center","indent":0,"type":"heading","version":1,"tag":"h1"}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
          backgroundColor: "transparent",
        },
        body: {
          textboxState:
            '{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"Body Text","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}',
          backgroundColor: "transparent",
        },
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
      card.id === cardId
        ? {
            ...card,
            [field]: {
              ...(typeof card[field] === "string"
                ? { textboxState: value }
                : { ...card[field], textboxState: value }),
            },
          }
        : card,
    );
    updateContent(updatedCards);
  };

  const handleMouseDown = (e: React.MouseEvent | MouseEvent) => {
    e.stopPropagation();
    onMouseDown?.();
  };

  if (isDragOverlay) {
    return (
      <div className="w-[400px] h-[200px] flex justify-between items-center gap-2">
        <ArrowLeftToLine size={24} color="gray" />
        <div className="relative w-full h-full bg-gray-100 flex justify-end items-center p-1 outline outline-2 outline-blue-500">
          <div className="absolute top-2 right-4 px-3 py-1 bg-blue-600 text-white text-sm rounded shadow">
            Add Text Card
          </div>
          <div className="absolute top-10 right-4 px-3 py-1 bg-green-600 text-white text-sm rounded shadow">
            Add Image Card
          </div>
        </div>
        <ArrowRightToLine size={24} color="gray" />
      </div>
    );
  }

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
                    : "w-full sm:w-1/2 md:w-[90%] lg:w-1/3 xl:w-1/4"
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
                    {/* Section Title */}
                    <LexicalComposer initialConfig={RichTextInitialConfig}>
                      <div
                        className="mt-2 rounded"
                        style={{
                          backgroundColor:
                            card.title?.backgroundColor || "transparent",
                        }}
                      >
                        <RichTextbox
                          isPreview={isPreview || isPublish}
                          textboxState={
                            card.title?.textboxState ||
                            HeaderRichTextDefaultContent.textboxState
                          }
                          updateTextboxState={(newState) => {
                            handleTextCardChange(card.id, "title", newState);
                          }}
                          isActive={isActive}
                        />
                      </div>
                    </LexicalComposer>

                    {/* Body */}
                    <LexicalComposer initialConfig={RichTextInitialConfig}>
                      <div
                        className="mt-2 rounded"
                        style={{
                          backgroundColor:
                            card.body?.backgroundColor || "transparent",
                        }}
                      >
                        <RichTextbox
                          isPreview={isPreview || isPublish}
                          textboxState={
                            card.body?.textboxState ||
                            RichTextDefaultContent.textboxState
                          }
                          updateTextboxState={(newState) => {
                            handleTextCardChange(card.id, "body", newState);
                          }}
                          isActive={isActive}
                        />
                      </div>
                    </LexicalComposer>
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
      onDragStart={() => {
        setIsDragging(true);
        setShowOverlay(false);
      }}
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
        {/* Overlay for enabling drag */}
        {(showOverlay || !isActive) && (
          <div
            className="w-full h-full flex items-center justify-center absolute inset-0 z-10"
            onMouseDown={() => setShowOverlay(true)}
          ></div>
        )}

        <div
          onMouseEnter={() => setShowOverlay(false)} // remove overlay when interacting with iframe
          onMouseDown={(e) => e.stopPropagation()} // capture mouse movements
          className="cursor-default w-full h-full"
        >
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
                      : "w-full sm:w-1/2 md:w-[90%] lg:w-1/3 xl:w-1/4"
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
                        const updated = cards.map((c) =>
                          c.id === id ? { ...c, imageUrl: url } : c,
                        );
                        updateContent(updated);
                      }}
                      setPreviewSrc={(id, url) => {
                        setPreviewSrcs((prev) => {
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
                            current.positionPercent?.x !==
                              layout.positionPercent.x ||
                            current.positionPercent?.y !==
                              layout.positionPercent.y)
                        ) {
                          const updated = cards.map((c) =>
                            c.id === cardId ? { ...c, ...layout } : c,
                          );
                          updateContent(updated);
                        }
                      }}
                    />
                  ) : (
                    <div className="p-4">
                      <div
                        onFocus={() => {
                          setSelectedTitleCardId(card.id);
                          setSelectedBodyCardId(null);
                        }}
                      >
                        {/* Section Title */}
                        <LexicalComposer initialConfig={RichTextInitialConfig}>
                          {isActive && selectedTitleCardId === card.id && (
                            <div
                              className="fixed left-0 z-[100]"
                              style={{
                                top: `-${position.y}px`,
                              }}
                            >
                              <RichTextToolbarPlugin
                                updateBackgroundColor={(newColor) =>
                                  updateCardBackgroundColor(
                                    card.id,
                                    "title",
                                    newColor,
                                  )
                                }
                              />
                            </div>
                          )}
                          <div
                            className="focus:outline focus:outline-2 focus:outline-blue-500 hover:outline hover:outline-2 hover:outline-gray-300 rounded"
                            style={{
                              backgroundColor:
                                card.title?.backgroundColor || "transparent",
                            }}
                          >
                            <RichTextbox
                              isPreview={isPreview}
                              textboxState={
                                card.title?.textboxState ||
                                HeaderRichTextDefaultContent.textboxState
                              }
                              updateTextboxState={(newState) => {
                                handleTextCardChange(
                                  card.id,
                                  "title",
                                  newState,
                                );
                              }}
                              isActive={isActive}
                            />
                          </div>
                        </LexicalComposer>
                      </div>

                      {/* Body */}
                      <div
                        onFocus={() => {
                          setSelectedBodyCardId(card.id);
                          setSelectedTitleCardId(null);
                        }}
                      >
                        <LexicalComposer initialConfig={RichTextInitialConfig}>
                          {isActive && selectedBodyCardId === card.id && (
                            <div
                              className="fixed left-0 z-[100]"
                              style={{
                                top: `-${position.y}px`,
                              }}
                            >
                              <RichTextToolbarPlugin
                                updateBackgroundColor={(newColor) =>
                                  updateCardBackgroundColor(
                                    card.id,
                                    "body",
                                    newColor,
                                  )
                                }
                              />
                            </div>
                          )}
                          <div
                            className="mt-2 focus:outline focus:outline-2 focus:outline-blue-500 hover:outline hover:outline-2 hover:outline-gray-300 rounded"
                            style={{
                              backgroundColor:
                                card.body?.backgroundColor || "transparent",
                            }}
                          >
                            <RichTextbox
                              isPreview={isPreview}
                              textboxState={
                                card.body?.textboxState ||
                                RichTextDefaultContent.textboxState
                              }
                              updateTextboxState={(newState) => {
                                handleTextCardChange(card.id, "body", newState);
                              }}
                              isActive={isActive}
                            />
                          </div>
                        </LexicalComposer>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </ActiveOutlineContainer>
    </Rnd>
  );
}
