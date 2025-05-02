// Taken from https://github.com/facebook/lexical/blob/0ce1a9041163216385e97f31b5e510f8e8411937/packages/lexical-playground/src/utils/getSelectedNode.ts#L11C8-L27C2

import { $isAtNodeEnd } from "@lexical/selection";
import { ElementNode, RangeSelection, TextNode } from "lexical";

export function getSelectedNode(
  selection: RangeSelection,
): TextNode | ElementNode {
  const anchor = selection.anchor;
  const focus = selection.focus;
  const anchorNode = selection.anchor.getNode();
  const focusNode = selection.focus.getNode();
  if (anchorNode === focusNode) {
    return anchorNode;
  }
  const isBackward = selection.isBackward();
  if (isBackward) {
    return $isAtNodeEnd(focus) ? anchorNode : focusNode;
  } else {
    return $isAtNodeEnd(anchor) ? anchorNode : focusNode;
  }
}
