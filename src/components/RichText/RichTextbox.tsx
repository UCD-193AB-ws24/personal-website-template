"use client";
/* eslint-disable react-hooks/exhaustive-deps */

import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  EditorState,
} from "lexical";
import { useEffect } from "react";

import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { TabIndentationPlugin } from "@lexical/react/LexicalTabIndentationPlugin";
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin";
import { LexicalEditor } from "lexical";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { OnChangePlugin } from "@lexical/react/LexicalOnChangePlugin";
import "@components/RichText/RichText.css";
import RichTextLinks from "./Plugins/RichTextLinks";

interface RichTextboxProps {
  isPreview: boolean;
  textboxState: string;
  updateTextboxState: (val: string) => void;
  isActive?: boolean;
}

export default function RichTextbox({
  isPreview,
  textboxState,
  updateTextboxState,
  isActive = false,
}: RichTextboxProps) {
  const [editor] = useLexicalComposerContext();

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
  }, []);

  const onChangeHandler = (
    editorState: EditorState,
    _editor: LexicalEditor,
    _tags: Set<string>,
  ) => {
    updateTextboxState(JSON.stringify(editorState.toJSON()));
  };

  return (
    <div className="relative rounded-[2px] text-left h-full whitespace-pre-wrap bg-transparent resize-none text-lg leading-none">
      <div className="bg-transparent h-full">
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className="min-h-[150px] h-full resize-none outline-0 bg-transparent"
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
        <LinkPlugin />
        <HistoryPlugin />
        <TabIndentationPlugin />
        <RichTextLinks isActive={isActive} isPreview={isPreview} />
      </div>
    </div>
  );
}
