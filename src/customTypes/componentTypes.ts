export interface Position {
  x: number;
  y: number;
}

export interface Size {
  width: number;
  height: number;
}

export interface ComponentItem {
  id: string;
  type: string;
  position: Position;
  size: Size;
  initialPos?: Position;
  initialSize?: Size;
  components?: ComponentItem[];
  updateComponent?: (
    id: string,
    newPos: { x: number; y: number },
    newSize: { width: number; height: number },
    content?: any
  ) => void;
  isActive?: boolean
  onMouseDown?: any
  setIsDragging?: (dragging: boolean) => void;
  content?: any
  isPreview?: boolean
}

