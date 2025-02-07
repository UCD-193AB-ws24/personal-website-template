import type {
  ComponentItem,
  Position,
  Size,
} from "@customTypes/componentTypes";

// TODO: collision detection on drops is still buggy for components placed on top half of another
export const isColliding = (
  newPos: Position,
  newSize: Size,
  components: ComponentItem[],
  activeComponentId: string,
): boolean => {
  const buffer = 5;

  return components.some((comp) => {
    if (comp.id === activeComponentId) return false;

    const rect1 = {
      left: newPos.x - buffer,
      top: newPos.y - buffer,
      right: newPos.x + newSize.width + buffer,
      bottom: newPos.y + newSize.height + buffer,
    };

    const rect2 = {
      left: comp.position.x - buffer,
      top: comp.position.y - buffer,
      right: comp.position.x + comp.size.width + buffer,
      bottom: comp.position.y + comp.size.height + buffer,
    };

    return (
      rect1.left < rect2.right &&
      rect1.right > rect2.left &&
      rect1.top < rect2.bottom &&
      rect1.bottom > rect2.top
    );
  });
};

/**
 * Finds the nearest available position to drop a component without overlapping existing components.
 *
 * When a component is dragged and dropped, this function checks if the intended drop position
 * collides with any other components. If there is a collision, it searches for the closest
 * non-colliding position in an outward spiral pattern from the original cursor position.
 *
 * @param {Position} startPos - The initial position where the component is intended to be dropped.
 * @param {Size} newSize - The dimensions of the component being dropped.
 * @param {ComponentItem[]} components - The list of existing components on the canvas.
 * @param {string} activeComponentId - The ID of the component being moved, to exclude it from collision checks.
 * @returns {Position} - The nearest available position without collisions. If no free spot is found within
                         the maximum search radius, returns the original position.
 */
export const findBestFreeSpot = (
  startPos: Position,
  newSize: Size,
  components: ComponentItem[],
  activeComponentId: string,
): Position => {
  if (!isColliding(startPos, newSize, components, activeComponentId)) {
    return startPos;
  }

  const step = 10;
  let angle = 0;
  let radius = 0;

  while (radius < 500) {
    const newX = startPos.x + radius * Math.cos(angle);
    const newY = startPos.y + radius * Math.sin(angle);
    const candidatePos = { x: Math.max(0, newX), y: Math.max(0, newY) };

    if (!isColliding(candidatePos, newSize, components, activeComponentId)) {
      return candidatePos;
    }

    angle += Math.PI / 4; // Move in a circular pattern
    if (angle >= 2 * Math.PI) {
      angle = 0;
      radius += step;
    }
  }

  return startPos; // No free spot found within radius
};
