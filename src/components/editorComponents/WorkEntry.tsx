"use client";

import React, { useEffect, useState } from "react";
import { Rnd } from "react-rnd";

import ActiveOutlineContainer from "@components/editorComponents/ActiveOutlineContainer";

import type {
  ComponentItem,
  Position,
  Size,
} from "@customTypes/componentTypes";

import { handleDragStop, handleResizeStop } from "@utils/dragResizeUtils";
import { GRID_SIZE } from "@utils/constants";

interface WorkEntryContent {
  company: string;
  jobTitle: string;
  duration: string;
  details: string;
}

interface WorkEntryProps {
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

export default function WorkEntry({
  id = "",
  initialPos = { x: -1, y: -1 },
  initialSize = { width: 200, height: 50 },
  components = [],
  content = "",
  updateComponent = () => {},
  isActive = true,
  onMouseDown: onMouseDown = () => {},
  setIsDragging = () => {},
  isPreview = false,
}: WorkEntryProps) {
  const [position, setPosition] = useState(initialPos);
  const [size, setSize] = useState(initialSize);
  const [curContent, setCurContent] = useState({
    company: "Company",
    jobTitle: "Job Title",
    duration: "Jan 20XX - Dec 20XX",
    details: "Details",
  });
  const [showOverlay, setShowOverlay] = useState(false);

  useEffect(() => {
    try {
      const jsonContent = JSON.parse(content);
      setCurContent(jsonContent);
    } catch {
      setCurContent({
        company: "Company",
        jobTitle: "Job Title",
        duration: "Jan 20XX - Dec 20XX",
        details: "Details",
      });
    }
  }, [content]);

  const handleMouseDown = (e: MouseEvent) => {
    e.stopPropagation();
    onMouseDown();
  };

  return isPreview ? (
    <div
      style={{
        position: "absolute",
        left: position.x,
        top: position.y,
        width: size.width,
        height: size.height,
        padding: `${GRID_SIZE}px`,
      }}
      className="flex w-full h-full justify-between whitespace-pre-wrap bg-transparent overflow-hidden resize-none text-lg gap-[50px]"
    >
      <div className="flex flex-col gap-[40px]">
        <div className="flex flex-col gap-[10px]">
          <h1
            draggable="false"
            className="overflow-hidden min-w-[300px] max-w-[300px] min-h-[27px] max-h-[35px] text-black text-2xl font-bold cursor-text p-0 m-0 leading-none rounded-sm"
          >
            {curContent.company}
          </h1>
          <p
            draggable="false"
            className="overflow-hidden min-h-[24px] max-h-[24px] min-w-[300px] max-w-[300px] rounded-sm"
          >
            {curContent.jobTitle}
          </p>
        </div>
        <p
          draggable="false"
          className="overflow-hidden min-h-[24px] max-h-[24px] min-w-[300px] max-w-[300px]"
        >
          {curContent.duration}
        </p>
      </div>
      <p
        draggable="false"
        className="overflow-hidden min-w-[370px] flex-grow resize-none bg-transparent text-lg leading-none"
      >
        {curContent.details}
      </p>
    </div>
  ) : (
    <Rnd
      size={{ width: size.width, height: size.height }}
      position={{ x: position.x, y: position.y }}
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
        handleResizeStop(id, components, updateComponent, setSize, setPosition)(
          e,
          d,
          ref,
          delta,
          newPosition,
        );
      }}
      minHeight={150}
      minWidth={750}
      bounds="parent"
      onMouseDown={handleMouseDown}
      style={{ pointerEvents: "auto" }}
      dragGrid={[GRID_SIZE, GRID_SIZE]}
      resizeGrid={[GRID_SIZE, GRID_SIZE]}
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
          className="cursor-default"
        >
          <div
            className="flex w-full h-full justify-between whitespace-pre-wrap bg-transparent overflow-hidden resize-none text-lg gap-[50px]"
            style={{ padding: `${GRID_SIZE}px` }}
          >
            <div className="flex flex-col gap-[40px]">
              <div className="flex flex-col gap-[10px]">
                <h1
                  contentEditable
                  suppressContentEditableWarning
                  draggable="false"
                  className="overflow-hidden min-w-[300px] max-w-[300px] min-h-[27px] max-h-[35px] text-black text-2xl font-bold cursor-text p-0 m-0 leading-none outline outline-gray-300 rounded-sm"
                  style={{
                    outline: `${!isActive ? "none" : ""}`,
                  }}
                  onBlur={(e) => {
                    setCurContent((prevContent: WorkEntryContent) => ({
                      ...prevContent,
                      company: e.target.innerText,
                    }));
                    updateComponent(
                      id,
                      position,
                      size,
                      JSON.stringify({
                        ...curContent,
                        company: e.target.innerText,
                      }),
                    );
                  }}
                >
                  {curContent.company}
                </h1>
                <p
                  contentEditable
                  suppressContentEditableWarning
                  draggable="false"
                  className="overflow-hidden min-h-[24px] max-h-[24px] min-w-[300px] max-w-[300px] outline outline-gray-300 rounded-sm"
                  style={{
                    outline: `${!isActive ? "none" : ""}`,
                  }}
                  onBlur={(e) => {
                    setCurContent((prevContent: WorkEntryContent) => ({
                      ...prevContent,
                      jobTitle: e.target.innerText,
                    }));
                    updateComponent(
                      id,
                      position,
                      size,
                      JSON.stringify({
                        ...curContent,
                        jobTitle: e.target.innerText,
                      }),
                    );
                  }}
                >
                  {curContent.jobTitle}
                </p>
              </div>
              <p
                contentEditable
                suppressContentEditableWarning
                draggable="false"
                className="overflow-hidden min-h-[24px] max-h-[24px] min-w-[300px] max-w-[300px] outline outline-gray-300 rounded-sm"
                style={{
                  outline: `${!isActive ? "none" : ""}`,
                }}
                onBlur={(e) => {
                  setCurContent((prevContent: WorkEntryContent) => ({
                    ...prevContent,
                    duration: e.target.innerText,
                  }));
                  updateComponent(
                    id,
                    position,
                    size,
                    JSON.stringify({
                      ...curContent,
                      duration: e.target.innerText,
                    }),
                  );
                }}
              >
                {curContent.duration}
              </p>
            </div>
            <p
              contentEditable
              suppressContentEditableWarning
              draggable="false"
              className="overflow-hidden min-w-[370px] flex-grow resize-none bg-transparent text-lg leading-none outline outline-gray-300 rounded-sm"
              style={{
                outline: `${!isActive ? "none" : ""}`,
              }}
              onBlur={(e) => {
                setCurContent((prevContent: WorkEntryContent) => ({
                  ...prevContent,
                  details: e.target.innerText,
                }));
                updateComponent(
                  id,
                  position,
                  size,
                  JSON.stringify({
                    ...curContent,
                    details: e.target.innerText,
                  }),
                );
              }}
            >
              {curContent.details}
            </p>
          </div>
        </div>
      </ActiveOutlineContainer>
    </Rnd>
  );
}
