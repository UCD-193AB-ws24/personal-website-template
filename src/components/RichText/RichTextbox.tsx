import {$createParagraphNode, $createTextNode, $getRoot, EditorState} from 'lexical';
import {useEffect} from 'react';

import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
import {ContentEditable} from '@lexical/react/LexicalContentEditable';
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import {ClickableLinkPlugin} from '@lexical/react/LexicalClickableLinkPlugin';
import {
  LexicalEditor,
} from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import "./RichText.css";


interface RichTextboxProps {
  isPreview: boolean;
  textboxState: string;
  updateTextboxState: (val: string) => void;
}

export default function RichTextbox({ isPreview, textboxState, updateTextboxState }: RichTextboxProps) {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (isPreview) {
      editor.setEditable(false);
    }

    try {
      const editorState = editor.parseEditorState(textboxState)
      editor.setEditorState(editorState);
    } catch (error: any) {
      console.log("Error:", error.message)

      // Fallback: set the content to be the textboxState
      editor.update(() => {
        const root = $getRoot();
        root.clear();

        const paragraph = $createParagraphNode();
        const text = $createTextNode(textboxState);
        paragraph.append(text)
        root.append(paragraph);
      })
    }
  }, [editor, isPreview, textboxState])

  const onChangeHandler = (editorState: EditorState, _editor: LexicalEditor, _tags: Set<string>) => {
    updateTextboxState(JSON.stringify(editorState.toJSON()));
  }

  return (
    <div className="rounded-[2px] relative text-left h-full whitespace-pre-wrap bg-transparent overflow-hidden resize-none text-lg leading-none bg-white">
      <div className="bg-white relative h-full">
        <RichTextPlugin
          contentEditable={
            <ContentEditable
              className="min-h-[150px] h-full resize-none relative outline-0"
              aria-placeholder={'Enter some text...'}
              placeholder={<div className="absolute top-0 left-0 text-[#999999]">Enter some text...</div>}
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
      </div>
    </div>
  );
}
