import React from "react";

import { ComponentItem } from "@customTypes/componentTypes";
import { componentMap } from "@utils/componentUtils";

export function getMaxRight(components: ComponentItem[]): number {
  return Math.max(
    ...components
      .filter((c) => c.type !== "navBar" && c.type !== "projectCard")
      .map((c) => c.position.x + c.size.width),
  );
}

export function getLowestY(components: ComponentItem[]): number {
  return Math.max(
    ...components.map((comp) => comp.position.y + comp.size.height),
  );
}

export function splitComponentsAtFirstProjectCard(
  components: ComponentItem[],
): { beforeProjectCard: ComponentItem[]; fromProjectCardOn: ComponentItem[] } {
  const sorted = [...components].sort((a, b) => {
    if (a.position.y !== b.position.y) {
      return a.position.y - b.position.y;
    }
    return a.position.x - b.position.x;
  });

  const projectCardIndex = sorted.findIndex((c) => c.type === "projectCard");

  if (projectCardIndex !== -1) {
    return {
      beforeProjectCard: sorted.slice(0, projectCardIndex),
      fromProjectCardOn: sorted.slice(projectCardIndex),
    };
  }

  return {
    beforeProjectCard: sorted,
    fromProjectCardOn: [],
  };
}

function groupByRows(
  components: ComponentItem[],
  threshold = 10,
): ComponentItem[][] {
  const sorted = [...components].sort((a, b) => a.position.y - b.position.y);
  const rows: ComponentItem[][] = [];

  for (const comp of sorted) {
    const lastRow = rows[rows.length - 1];
    if (
      lastRow &&
      Math.abs(lastRow[0].position.y - comp.position.y) <= threshold
    ) {
      lastRow.push(comp);
    } else {
      rows.push([comp]);
    }
  }

  return rows;
}

export function renderGroupedRows(
  components: ComponentItem[],
): React.ReactElement[] {
  const grouped = groupByRows(components);

  return grouped.map((row, rowIndex) => {
    let rowMarginTop = 0;

    if (rowIndex === 0) {
      rowMarginTop = row[0].position.y;
    } else {
      const prevRow = grouped[rowIndex - 1];
      const lastCompInPrevRow = prevRow[prevRow.length - 1];
      rowMarginTop =
        row[0].position.y -
        (lastCompInPrevRow.position.y + lastCompInPrevRow.size.height);
    }

    return (
      <div
        key={rowIndex}
        className="relative flex w-full h-auto"
        style={{ marginTop: rowMarginTop }}
      >
        {row.map((comp) => {
          const Component = componentMap[comp.type];
          if (!Component) return null;

          const isProjectCard = comp.type === "projectCard";

          return (
            <div
              key={comp.id}
              style={{
                height: isProjectCard ? "max-content" : comp.size.height,
              }}
            >
              <Component
                id={comp.id}
                initialPos={{ ...comp.position, y: 0 }}
                initialSize={comp.size}
                content={comp?.content}
                {...(isProjectCard ? { isPublish: true } : { isPreview: true })}
              />
            </div>
          );
        })}
      </div>
    );
  });
}
