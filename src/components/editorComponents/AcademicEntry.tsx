'use client';

import React, { useEffect, useState } from 'react';
import { Rnd } from 'react-rnd';

import ActiveOutlineContainer from '@components/editorComponents/ActiveOutlineContainer';

import type {
	ComponentItem,
	Position,
	Size,
} from '@customTypes/componentTypes';

import { handleDragStop, handleResizeStop } from '@utils/dragResizeUtils';
import { GRID_SIZE } from '@utils/constants';

interface AcademicEntryContent {
	schoolName: string;
	subtext: string;
	duration: string;
}

interface AcademicEntryProps {
	id?: string;
	initialPos?: Position;
	initialSize?: Size;
	components?: ComponentItem[];
	content?: any;
	updateComponent?: (
		id: string,
		newPos: Position,
		newSize: Size,
		content?: any
	) => void;
	isActive?: boolean;
	onMouseDown?: () => void;
	setIsDragging?: (dragging: boolean) => void;
	isPreview?: boolean;
}

export default function AcademicEntry({
	id = '',
	initialPos = { x: -1, y: -1 },
	initialSize = { width: 200, height: 50 },
	components = [],
	content = '',
	updateComponent = () => {},
	isActive = true,
	onMouseDown: onMouseDown = () => {},
	setIsDragging = () => {},
	isPreview = false,
}: AcademicEntryProps) {
	const [position, setPosition] = useState(initialPos);
	const [size, setSize] = useState(initialSize);
	const [curContent, setCurContent] = useState({
		schoolName: "School",
		subtext: "Degree",
		duration: "Jan 20XX - Dec 20XX",
	});

	useEffect(() => {
		try {
			const jsonContent = JSON.parse(content);
			setCurContent(jsonContent);
		} catch (e) {
			setCurContent({
				schoolName: "School",
				subtext: "Degree",
				duration: "Jan 20XX - Dec 20XX",
			})
		}
	},[])

	const handleMouseDown = (e: MouseEvent) => {
		e.stopPropagation();
		onMouseDown();
	};

	return isPreview ? (
		<div
			style={{
				position: 'absolute',
				left: position.x,
				top: position.y,
				width: size.width,
				height: size.height,
				padding: `${GRID_SIZE}px`,
			}}
			className="flex w-full h-full justify-between whitespace-pre-wrap bg-transparent overflow-hidden resize-none text-lg"
		>
			<div className="flex flex-col justify-between">
				<h1
					draggable="false"
					className="overflow-hidden min-w-[300px] max-w-[300px] max-h-[30px] text-black text-2xl font-bold cursor-text p-0 m-0 leading-none"
				>
					{curContent.schoolName}
				</h1>
				<p draggable="false" className="overflow-hidden min-h-[24px] max-h-[24px] min-w-[300px] max-w-[300px]">
					{curContent.subtext}
				</p>
			</div>

			<p
				draggable="false"
				className="overflow-hidden min-w-[300px] max-w-[300px] resize-none bg-transparent text-lg leading-none"
			>
				{curContent.duration}
			</p>
		</div>
	) : (
		<Rnd
			size={{ width: size.width, height: size.height }}
			position={{ x: position.x, y: position.y }}
			onDragStart={() => {
				setIsDragging(true);
			}}
			onDragStop={(e, d) => {
				setIsDragging(false);
				handleDragStop(
					id,
					size,
					components,
					updateComponent,
					setPosition
				)(e, d);
			}}
			onResizeStart={() => setIsDragging(true)}
			onResizeStop={(e, d, ref, delta, newPosition) => {
				setIsDragging(false);
				handleResizeStop(
					id,
					components,
					updateComponent,
					setSize,
					setPosition
				)(e, d, ref, delta, newPosition);
			}}
			minHeight={70}
			minWidth={600}
			bounds="parent"
			onMouseDown={handleMouseDown}
			style={{ pointerEvents: 'auto' }}
			dragGrid={[GRID_SIZE, GRID_SIZE]}
			resizeGrid={[GRID_SIZE, GRID_SIZE]}
		>
			<ActiveOutlineContainer isActive={isActive}>
				<div
					className="flex w-full h-full justify-between whitespace-pre-wrap bg-transparent overflow-hidden resize-none text-lg"
					style={{ padding: `${GRID_SIZE}px` }}
				>
					<div className="flex flex-col justify-between">
						<h1
							contentEditable
							suppressContentEditableWarning
							draggable="false"
							className="overflow-hidden min-w-[300px] max-w-[300px] max-h-[30px] text-black text-2xl font-bold cursor-text p-0 m-0 leading-none outline outline-gray-300 rounded-sm"
							style={{
								outline: `${!isActive ? 'none' : ''}`,
							}}
							onBlur={(e) => {
								console.log("heading:", e)
								setCurContent(
									(prevContent: AcademicEntryContent) => ({
										...prevContent,
										schoolName: e.target.innerText,
									})
								);
								updateComponent(id, position, size, JSON.stringify({
									...curContent,
									schoolName: e.target.innerText,
								}));
							}}
						>
							{curContent.schoolName}
						</h1>
						<p
							contentEditable
							suppressContentEditableWarning
							draggable="false"
							className="overflow-hidden min-h-[24px] max-h-[24px] min-w-[300px] max-w-[300px] outline outline-gray-300 rounded-sm"
							style={{
								outline: `${!isActive ? 'none' : ''}`,
							}}
							onBlur={(e) => {
								setCurContent(
									(prevContent: AcademicEntryContent) => ({
										...prevContent,
										subtext: e.target.innerText,
									})
								);
								updateComponent(id, position, size, JSON.stringify({
									...curContent,
									subtext: e.target.innerText,
								}));
							}}
						>
							{curContent.subtext}
						</p>
					</div>

					<p
						contentEditable
						suppressContentEditableWarning
						draggable="false"
						className="overflow-hidden min-w-[300px] max-w-[300px] resize-none bg-transparent text-lg leading-none outline outline-gray-300 rounded-sm"
						style={{
							outline: `${!isActive ? 'none' : ''}`,
						}}
						onBlur={(e) => {
							setCurContent(
								(prevContent: AcademicEntryContent) => ({
									...prevContent,
									duration: e.target.innerText,
								})
							);
							updateComponent(id, position, size, JSON.stringify({
								...curContent,
								duration: e.target.innerText,
							}));
						}}
					>
						{curContent.duration}
					</p>
				</div>
			</ActiveOutlineContainer>
		</Rnd>
	);
}
