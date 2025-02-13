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
  initialX?: number;
  initialY?: number;
  initialSize?: Size;
  components?: ComponentItem[];
  updateComponent?: (
    id: string,
    newPos: { x: number; y: number },
    newSize: { width: number; height: number }
  ) => void;
  isActive?: boolean
  onMouseDown?: any
}

