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
}
