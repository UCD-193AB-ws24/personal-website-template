/* eslint-disable react-hooks/exhaustive-deps */
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  $isRangeSelection,
  EditorState,
  KEY_ESCAPE_COMMAND,
  NodeKey,
} from "lexical";
import { $findMatchingParent, mergeRegister } from "@lexical/utils";
import { useEffect, useRef, useState } from "react";
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
import { Text, Search } from "lucide-react";
import isValidURL from "@components/RichText/utils/isValidURL";


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
  const linkEditorRef = useRef<HTMLDivElement | null>(null);
  const [isLinkEditorVisible, setIsLinkEditorVisible] = useState(false);
  const [linkEditorPosition, setLinkEditorPosition] = useState<Position>({
    x: 0,
    y: 0,
  });
  const [linkEditorTextField, setLinkEditorTextField] = useState("");
  const [linkEditorURLField, setLinkEditorURLField] = useState("");
  const [lastActiveLinkNodeKey, setLastActiveLinkNodeKey] = useState<NodeKey>("")
  const [escapePressed, setEscapePressed] = useState(false);

  // Using refs inside the useEffect's dependency list since using state variables
  // in the dependency list causes the lexical editor to defocus on change
  const lastActiveLinkNodeKeyRef = useRef(lastActiveLinkNodeKey);
  const escapePressedRef = useRef(escapePressed);

  // Update refs whenever their corresponding state variable updates
  useEffect(() => {
    lastActiveLinkNodeKeyRef.current = lastActiveLinkNodeKey
  }, [lastActiveLinkNodeKey])

  useEffect(() => {
    escapePressedRef.current = escapePressed
  }, [escapePressed])

  const handleBlur = (e: FocusEvent) => {
    if (linkEditorRef.current && e.relatedTarget instanceof Node && linkEditorRef.current.contains(e.relatedTarget)) {
      return;
    }
    setIsLinkEditorVisible(false);
  }

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

              // If the user clicks escape while editing a link, we want
              // to hide the link editor until the user clicks on another node
              // and then clicks back on the link
              if (!escapePressedRef.current || (escapePressedRef.current && linkParent.getKey() !== lastActiveLinkNodeKeyRef.current)) {
                setIsLinkEditorVisible(true);
                setLinkEditorTextField(node.getTextContent());
                setLinkEditorURLField(linkParent.getURL());
                setLastActiveLinkNodeKey(linkParent.getKey());
                setEscapePressed(false);
              }
            } else {
              setLinkEditorPosition({ x: 0, y: 0 });
              setIsLinkEditorVisible(false);
              setLinkEditorTextField("");
              setLinkEditorURLField("");
              setLastActiveLinkNodeKey("");
              setEscapePressed(true);
            }
          } else {
            // Reset escape pressed if the cursor isn't over a link node
            setEscapePressed(false);
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
          setEscapePressed(true);

          // Return true stops propagation to other command handlers
          return true;
        },
        LowPriority,
      ),
      editor.registerRootListener((rootElement, prevRootElement) => {
        // Hide link editor when editor isn't in focus
        rootElement?.addEventListener('blur', handleBlur)
        prevRootElement?.removeEventListener('blur', handleBlur)
      })
    );
  }, [editor, lastActiveLinkNodeKeyRef, escapePressedRef]);

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
          ref={linkEditorRef}
          hidden={!isLinkEditorVisible}
          className="absolute z-[10000] gap-[4px] p-2 bg-white shadow-[0px_0px_37px_-14px_rgba(0,_0,_0,_1)] rounded-md"
          style={{ display: `${isLinkEditorVisible ? "flex" : "none" }`, left: linkEditorPosition.x, top: linkEditorPosition.y }}
        >
          <div className="flex justify-center items-center gap-[4px] p-1 border rounded-md focus-within:border-blue-500">
            <Text size={16} />
            <input
              className="text-sm focus:outline-none"
              type="text"
              placeholder="Text"
              value={linkEditorTextField}
              onChange={(e) => {
                setLinkEditorTextField(e.target.value);
              }}
            />
          </div>
          <div className="flex justify-center items-center gap-[4px] p-1 border rounded-md focus-within:border-blue-500">
            <Search size={16} />
            <input
              className="text-sm focus:outline-none"
              type="url"
              placeholder="URL"
              value={linkEditorURLField}
              onChange={(e) => {
                setLinkEditorURLField(e.target.value);
              }}
            />
          </div>
          <button
            className="text-sm text-blue-500 font-bold ml-[16px]"
            onClick={() => {
              if (!isValidURL(linkEditorURLField)) {
                return;
              }

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
