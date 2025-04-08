/* eslint-disable react-hooks/exhaustive-deps */
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  EditorState,
  KEY_ESCAPE_COMMAND,
} from "lexical";
import { $findMatchingParent, mergeRegister } from "@lexical/utils";
import { useEffect, useState } from "react";
import { $createLinkNode, $isLinkNode } from "@lexical/link";

import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { ClickableLinkPlugin } from "@lexical/react/LexicalClickableLinkPlugin";
import { LexicalEditor } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import "./RichText.css";
import { getSelectedNode } from "./utils/getSelectedNode";
import { Position } from "@customTypes/componentTypes";

const LowPriority = 1;

interface RichTextboxProps {
  isPreview: boolean;
  textboxState: string;
  updateTextboxState: (val: string) => void;
}

export default function RichTextbox({
  isPreview,
  textboxState,
  updateTextboxState,
}: RichTextboxProps) {
  const [editor] = useLexicalComposerContext();
  const [isLinkEditorVisible, setIsLinkEditorVisible] = useState(false);
  const [linkEditorPosition, setLinkEditorPosition] = useState<Position>({
    x: 0,
    y: 0,
  });
  const [linkEditorTextField, setLinkEditorTextField] = useState("");
  const [linkEditorURLField, setLinkEditorURLField] = useState("");

  useEffect(() => {
    if (isPreview) {
      editor.setEditable(false);
    }

    try {
      const editorState = editor.parseEditorState(textboxState);
      editor.setEditorState(editorState);
    } catch (error: any) {
      console.log("Error:", error.message);

      // Fallback: set the content to be the textboxState
      editor.update(() => {
        const root = $getRoot();
        root.clear();

        const paragraph = $createParagraphNode();
        const text = $createTextNode(textboxState);
        paragraph.append(text);
        root.append(paragraph);
      });
    }

    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const node = getSelectedNode(selection);
            const linkParent = $findMatchingParent(node, $isLinkNode);
            if (linkParent) {
              const element = editor.getElementByKey(node.getKey());
              if (element) {
                setLinkEditorPosition({
                  x: element.offsetLeft,
                  y: element.offsetTop + element.offsetHeight,
                });
              }

              setIsLinkEditorVisible(true);
              setLinkEditorTextField(node.getTextContent());
              setLinkEditorURLField(linkParent.getURL());
            } else {
              setLinkEditorPosition({ x: 0, y: 0 });
              setIsLinkEditorVisible(false);
              setLinkEditorTextField("");
              setLinkEditorURLField("");
            }
          }
        });
      }),
      editor.registerCommand(
        KEY_ESCAPE_COMMAND,
        () => {
          // Press <Esc> to hide link editor
          setLinkEditorPosition({ x: 0, y: 0 });
          setIsLinkEditorVisible(false);
          setLinkEditorTextField("");
          setLinkEditorURLField("");
          return true;
        },
        LowPriority,
      ),
    );
  }, []);

  const onChangeHandler = (
    editorState: EditorState,
    _editor: LexicalEditor,
    _tags: Set<string>,
  ) => {
    updateTextboxState(JSON.stringify(editorState.toJSON()));
  };

  return (
    <div className="rounded-[2px] text-left h-full whitespace-pre-wrap bg-transparent overflow-hidden resize-none text-lg leading-none bg-white">
      <div className="bg-white h-full">
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className="min-h-[150px] h-full resize-none outline-0"
              aria-placeholder={"Enter some text..."}
              placeholder={
                <div className="absolute top-0 left-0 text-[#999999]">
                  Enter some text...
                </div>
              }
            />
          }
          ErrorBoundary={LexicalErrorBoundary}
        />
        <OnChangePlugin onChange={onChangeHandler} />
        <ListPlugin />
        <ClickableLinkPlugin />
        <LinkPlugin />
        <HistoryPlugin />
        <TabIndentationPlugin />

        <div
          hidden={!isLinkEditorVisible}
          className="absolute z-[10000]"
          style={{ left: linkEditorPosition.x, top: linkEditorPosition.y }}
        >
          <input
            type="text"
            placeholder="Text"
            value={linkEditorTextField}
            onChange={(e) => {
              setLinkEditorTextField(e.target.value);
            }}
          />
          <input
            type="url"
            placeholder="URL"
            value={linkEditorURLField}
            onChange={(e) => {
              setLinkEditorURLField(e.target.value);
            }}
          />
          <button
            onClick={() => {
              editor.update(() => {
                const selection = $getSelection();
                if ($isRangeSelection(selection)) {
                  const node = getSelectedNode(selection);
                  const linkParent = $findMatchingParent(node, $isLinkNode);

                  if (linkParent) {
                    // Replace the old link with a new link node containing the entered fields
                    const newLink = $createLinkNode(linkEditorURLField);
                    newLink.append($createTextNode(linkEditorTextField));

                    linkParent.replace(newLink);
                    newLink.select();
                  }
                }
              });
            }}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
