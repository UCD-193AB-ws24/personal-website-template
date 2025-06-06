import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { mergeRegister } from "@lexical/utils";
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
} from "@lexical/list";
import { $isLinkNode, $toggleLink, TOGGLE_LINK_COMMAND } from "@lexical/link";
import {
  $caretRangeFromSelection,
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  $isElementNode,
  $isTokenOrSegmented,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  createCommand,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  LexicalCommand,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
  BaseSelection,
  ElementNode,
  NodeKey,
  RangeSelection,
  TextNode,
} from "lexical";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Plus,
  Minus,
  Undo,
  Redo,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  List,
  ListOrdered,
  LucideLink,
  Baseline,
  PaintBucket,
} from "lucide-react";

const fontSizes = [
  "12px",
  "16px",
  "18px",
  "24px",
  "30px",
  "36px",
  "42px",
  "48px",
  "60px",
  "72px",
];
const LowPriority = 1;

function Divider() {
  return <div className="divider" />;
}

const SET_FONT_SIZE_COMMAND: LexicalCommand<string> = createCommand();
const SET_FONT_COLOR_COMMAND: LexicalCommand<string> = createCommand();

/* https://github.com/facebook/lexical/blob/main/packages/lexical-selection/src/constants.ts */
export const CSS_TO_STYLES: Map<string, Record<string, string>> = new Map();

/* ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ */

/* https://github.com/facebook/lexical/blob/main/packages/shared/src/invariant.ts */
export function invariant(cond?: boolean, message?: string): asserts cond {
  if (cond) {
    return;
  }

  throw new Error(
    "Internal Lexical error: invariant() is meant to be replaced at compile " +
      "time. There is no runtime version. Error: " +
      message,
  );
}

/* ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ */

/* https://github.com/facebook/lexical/blob/main/packages/lexical-selection/src/utils.ts */
export function getStyleObjectFromRawCSS(css: string): Record<string, string> {
  const styleObject: Record<string, string> = {};
  if (!css) {
    return styleObject;
  }
  const styles = css.split(";");

  for (const style of styles) {
    if (style !== "") {
      const [key, value] = style.split(/:([^]+)/); // split on first colon
      if (key && value) {
        styleObject[key.trim()] = value.trim();
      }
    }
  }

  return styleObject;
}

export function getStyleObjectFromCSS(css: string): Record<string, string> {
  let value = CSS_TO_STYLES.get(css);
  if (value === undefined) {
    value = getStyleObjectFromRawCSS(css);
    CSS_TO_STYLES.set(css, value);
  }

  return value;
}

export function getCSSFromStyleObject(styles: Record<string, string>): string {
  let css = "";

  for (const style in styles) {
    if (style) {
      css += `${style}: ${styles[style]};`;
    }
  }

  return css;
}

/* ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ */

/* https://github.com/facebook/lexical/blob/main/packages/lexical-selection/src/lexical-node.ts */
export function $patchStyle(
  target: TextNode | RangeSelection | ElementNode,
  patch: Record<
    string,
    | string
    | null
    | ((currentStyleValue: string | null, _target: typeof target) => string)
  >,
): void {
  invariant(
    $isRangeSelection(target)
      ? target.isCollapsed()
      : $isTextNode(target) || $isElementNode(target),
    "$patchStyle must only be called with a TextNode, ElementNode, or collapsed RangeSelection",
  );
  const prevStyles = getStyleObjectFromCSS(
    $isRangeSelection(target)
      ? target.style
      : $isTextNode(target)
        ? target.getStyle()
        : target.getTextStyle(),
  );
  const newStyles = Object.entries(patch).reduce<Record<string, string>>(
    (styles, [key, value]) => {
      if (typeof value === "function") {
        styles[key] = value(prevStyles[key], target);
      } else if (value === null) {
        delete styles[key];
      } else {
        styles[key] = value;
      }
      return styles;
    },
    { ...prevStyles },
  );
  const newCSSText = getCSSFromStyleObject(newStyles);
  if ($isRangeSelection(target) || $isTextNode(target)) {
    target.setStyle(newCSSText);
  } else {
    target.setTextStyle(newCSSText);
  }
  CSS_TO_STYLES.set(newCSSText, newStyles);
}

export function $patchStyleText(
  selection: BaseSelection,
  patch: Record<
    string,
    | string
    | null
    | ((
        currentStyleValue: string | null,
        target: TextNode | RangeSelection | ElementNode,
      ) => string)
  >,
): void {
  if ($isRangeSelection(selection) && selection.isCollapsed()) {
    $patchStyle(selection, patch);
    const emptyNode = selection.anchor.getNode();
    if ($isElementNode(emptyNode) && emptyNode.isEmpty()) {
      $patchStyle(emptyNode, patch);
    }
  }
  $forEachSelectedTextNode((textNode) => {
    $patchStyle(textNode, patch);
  });
}

export function $forEachSelectedTextNode(
  fn: (textNode: TextNode) => void,
): void {
  const selection = $getSelection();
  if (!selection) {
    return;
  }

  const slicedTextNodes = new Map<
    NodeKey,
    [startIndex: number, endIndex: number]
  >();
  const getSliceIndices = (
    node: TextNode,
  ): [startIndex: number, endIndex: number] =>
    slicedTextNodes.get(node.getKey()) || [0, node.getTextContentSize()];

  if ($isRangeSelection(selection)) {
    for (const slice of $caretRangeFromSelection(selection).getTextSlices()) {
      if (slice) {
        slicedTextNodes.set(
          slice.caret.origin.getKey(),
          slice.getSliceIndices(),
        );
      }
    }
  }

  const selectedNodes = selection.getNodes();
  for (const selectedNode of selectedNodes) {
    if (!($isTextNode(selectedNode) && selectedNode.canHaveFormat())) {
      continue;
    }
    const [startOffset, endOffset] = getSliceIndices(selectedNode);
    // No actual text is selected, so do nothing.
    if (endOffset === startOffset) {
      continue;
    }

    // The entire node is selected or a token/segment, so just format it
    if (
      $isTokenOrSegmented(selectedNode) ||
      (startOffset === 0 && endOffset === selectedNode.getTextContentSize())
    ) {
      fn(selectedNode);
    } else {
      // The node is partially selected, so split it into two or three nodes
      // and style the selected one.
      const splitNodes = selectedNode.splitText(startOffset, endOffset);
      const replacement = splitNodes[startOffset === 0 ? 0 : 1];
      fn(replacement);
    }
  }

  if (
    $isRangeSelection(selection) &&
    selection.anchor.type === "text" &&
    selection.focus.type === "text" &&
    selection.anchor.key === selection.focus.key
  ) {
    $ensureForwardRangeSelection(selection);
  }
}

export function $ensureForwardRangeSelection(selection: RangeSelection): void {
  if (selection.isBackward()) {
    const { anchor, focus } = selection;
    // stash for the in-place swap
    const { key, offset, type } = anchor;
    anchor.set(focus.key, focus.offset, focus.type);
    focus.set(key, offset, type);
  }
}

/* ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ */

interface RichTextToolbarPluginProps {
  updateBackgroundColor: (val: string) => void;
}

export default function RichTextToolbarPlugin({
  updateBackgroundColor,
}: RichTextToolbarPluginProps) {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  const [fontSize, setFontSize] = useState("18px");
  const [sizeChanged, setSizeChanged] = useState(false);
  const fontColorPickerRef = useRef(null);
  const boxColorPickerRef = useRef(null);
  const [isFontColorPickerOpened, setIsFontColorPickerOpened] = useState(false);
  const [isBoxColorPickerOpened, setIsBoxColorPickerOpened] = useState(false);

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {
      // Update text format
      setIsBold(selection.hasFormat("bold"));
      setIsItalic(selection.hasFormat("italic"));
      setIsUnderline(selection.hasFormat("underline"));
      setIsStrikethrough(selection.hasFormat("strikethrough"));

      // Update font size
      const nodes = selection.getNodes();
      const prevFontSize: string | null = null;

      for (const node of nodes) {
        if ($isTextNode(node)) {
          const style = node.getStyle();
          const match = style?.match(/font-size:\s*([^\s;]+)/);
          const currentFontSize = match?.[1] || null;

          if (!sizeChanged) {
            if (prevFontSize === null && currentFontSize === null) {
              // default size
              setFontSize("18px");
            } else if (currentFontSize !== null) {
              setFontSize(currentFontSize);
            }
          }
        }
      }
    }

    setSizeChanged(false);
  }, [sizeChanged]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          $updateToolbar();
        });
      }),
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        (_payload, _newEditor) => {
          $updateToolbar();
          return false;
        },
        LowPriority,
      ),
      editor.registerCommand(
        CAN_UNDO_COMMAND,
        (payload) => {
          setCanUndo(payload);
          return false;
        },
        LowPriority,
      ),
      editor.registerCommand(
        CAN_REDO_COMMAND,
        (payload) => {
          setCanRedo(payload);
          return false;
        },
        LowPriority,
      ),
      editor.registerCommand(
        SET_FONT_SIZE_COMMAND,
        (newSize: string) => {
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              $patchStyleText(selection, {
                "font-size": newSize,
              });
            }
          });
          return true;
        },
        LowPriority,
      ),
      editor.registerCommand(
        SET_FONT_COLOR_COMMAND,
        (newColor: string) => {
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              $patchStyleText(selection, {
                color: newColor,
              });
            }
          });
          return true;
        },
        LowPriority,
      ),
    );
  }, [editor, $updateToolbar]);

  return (
    <div className="toolbar fixed z-[100]" ref={toolbarRef}>
      <button
        disabled={!canUndo}
        onClick={() => {
          editor.dispatchCommand(UNDO_COMMAND, undefined);
        }}
        className="toolbar-item spaced"
        aria-label="Undo"
      >
        <Undo className="format undo" />
      </button>
      <button
        disabled={!canRedo}
        onClick={() => {
          editor.dispatchCommand(REDO_COMMAND, undefined);
        }}
        className="toolbar-item"
        aria-label="Redo"
      >
        <Redo className="format redo" />
      </button>
      <Divider />
      <div className="flex justify-evenly items-center">
        {/* Decrease button */}
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            if (!(fontSizes.indexOf(fontSize) === 0)) {
              setSizeChanged(true);
              const newSize = fontSizes[fontSizes.indexOf(fontSize) - 1];
              setFontSize(newSize);
              // console.log("decreasing font size to " + newSize);
              editor.dispatchCommand(SET_FONT_SIZE_COMMAND, newSize);
            }
          }}
        >
          <Minus className="format" />
        </button>

        {/* Font Size Label */}
        <h1> {fontSize} </h1>

        {/* Increase button */}
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => {
            if (!(fontSizes.indexOf(fontSize) === fontSizes.length - 1)) {
              setSizeChanged(true);
              const newSize = fontSizes[fontSizes.indexOf(fontSize) + 1];
              setFontSize(newSize);
              // console.log("increasing font size to " + newSize);
              editor.dispatchCommand(SET_FONT_SIZE_COMMAND, newSize);
            }
          }}
        >
          <Plus className="format" />
        </button>
      </div>
      <Divider />
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "bold");
        }}
        className={"toolbar-item spaced " + (isBold ? "active" : "")}
        aria-label="Format Bold"
      >
        <Bold className="format bold" />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "italic");
        }}
        className={"toolbar-item spaced " + (isItalic ? "active" : "")}
        aria-label="Format Italics"
      >
        <Italic className="format italic" />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "underline");
        }}
        className={"toolbar-item spaced " + (isUnderline ? "active" : "")}
        aria-label="Format Underline"
      >
        <Underline className="format underline" />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, "strikethrough");
        }}
        className={"toolbar-item spaced " + (isStrikethrough ? "active" : "")}
        aria-label="Format Strikethrough"
      >
        <Strikethrough className="format strikethrough" />
      </button>
      <div className="relative">
        <button
          onMouseDown={() => {
            const fontColorPicker =
              fontColorPickerRef.current! as HTMLInputElement;
            const boxColorPicker =
              boxColorPickerRef.current! as HTMLInputElement;
            if (isFontColorPickerOpened) {
              // Calling click again doesn't close the color picker
              // Instead, call blur to close it
              fontColorPicker.blur();
              setIsFontColorPickerOpened(false);
            } else {
              fontColorPicker.click();
              setIsFontColorPickerOpened(true);

              // Close box color picker if it's opened
              if (isBoxColorPickerOpened) {
                boxColorPicker.blur();
                setIsBoxColorPickerOpened(false);
              }
            }
          }}
          className="toolbar-item spaced"
          aria-label="Change text color"
        >
          <Baseline className="format justify-align" />
        </button>
        <input
          className="absolute w-[0px] h-[0px]"
          onChange={(e) => {
            const fontColor = e.target.value;
            editor.dispatchCommand(SET_FONT_COLOR_COMMAND, fontColor);
          }}
          ref={fontColorPickerRef}
          type="color"
        />
      </div>
      <Divider />
      <button
        onClick={() => {
          editor.update(() => {
            const selection = $getSelection();
            if (selection) {
              if (selection.getTextContent().length === 0) {
                return;
              }
              if ($isRangeSelection(selection)) {
                const nodes = selection.getNodes();
                if (nodes.length > 0) {
                  const parent = nodes[0].getParent();
                  if (
                    $isLinkNode(parent) ||
                    nodes.find((n) => $isLinkNode(n))
                  ) {
                    // Remove link if selecting a link node or selection has
                    // a link node
                    $toggleLink(null);
                  } else {
                    editor.dispatchCommand(TOGGLE_LINK_COMMAND, "");
                  }
                }
              }
            }
          });
        }}
        className="toolbar-item spaced"
        aria-label="Toggle link"
      >
        <LucideLink className="format justify-align" />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
        }}
        className="toolbar-item spaced"
        aria-label="Insert ordered list"
      >
        <ListOrdered className="format justify-align" />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
        }}
        className="toolbar-item spaced"
        aria-label="Insert unordered list"
      >
        <List className="format justify-align" />
      </button>
      <Divider />
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "left");
        }}
        className="toolbar-item spaced"
        aria-label="Left Align"
      >
        <AlignLeft className="format left-align" />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "center");
        }}
        className="toolbar-item spaced"
        aria-label="Center Align"
      >
        <AlignCenter className="format center-align" />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, "right");
        }}
        className="toolbar-item spaced"
        aria-label="Right Align"
      >
        <AlignRight className="format right-align" />
      </button>
      <Divider />
      <div className="relative">
        <button
          onMouseDown={() => {
            const boxColorPicker =
              boxColorPickerRef.current! as HTMLInputElement;
            const fontColorPicker =
              fontColorPickerRef.current! as HTMLInputElement;
            if (isBoxColorPickerOpened) {
              // Calling click again doesn't close the color picker
              // Instead, call blur to close it
              boxColorPicker.blur();
              setIsBoxColorPickerOpened(false);
            } else {
              boxColorPicker.click();
              setIsBoxColorPickerOpened(true);

              // Close font color picker if it's opened
              if (isFontColorPickerOpened) {
                fontColorPicker.blur();
                setIsFontColorPickerOpened(false);
              }
            }
          }}
          className="toolbar-item spaced"
          aria-label="Change textbox color"
        >
          <PaintBucket className="format justify-align" />
        </button>{" "}
        <input
          className="absolute w-[0px] h-[0px]"
          onChange={(e) => {
            updateBackgroundColor(e.target.value);
          }}
          ref={boxColorPickerRef}
          type="color"
        />
      </div>
    </div>
  );
}
