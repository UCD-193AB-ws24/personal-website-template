import {EditorState} from 'lexical';
import {useEffect} from 'react';

import {RichTextPlugin} from '@lexical/react/LexicalRichTextPlugin';
import {ContentEditable} from '@lexical/react/LexicalContentEditable';
import {HistoryPlugin} from '@lexical/react/LexicalHistoryPlugin';
import {LexicalErrorBoundary} from '@lexical/react/LexicalErrorBoundary';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import {
  LexicalEditor,
} from 'lexical';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import "./RichText.css";
import TreeViewPlugin from '@components/RichText/Plugins/RichTextTreeView';


interface RichTextboxProps {
  isPreview: boolean;
  textboxState: string;
  updateTextboxState: (val: string) => void;
  isActive?: boolean;
}

export default function RichTextbox({ isPreview, textboxState, updateTextboxState, isActive=false }: RichTextboxProps) {
  const [editor] = useLexicalComposerContext();
  const debug = false;

  useEffect(() => {
    if (isPreview) {
      editor.setEditable(false);
    }

    const editorState = editor.parseEditorState(textboxState)
    editor.setEditorState(editorState);
  }, [])

  const onChangeHandler = (editorState: EditorState, _editor: LexicalEditor, _tags: Set<string>) => {
    updateTextboxState(JSON.stringify(editorState.toJSON()));
  }

  return (
    <div className="rounded-[2px] relative text-left h-full whitespace-pre-wrap bg-transparent overflow-hidden resize-none text-lg leading-none">
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
        <HistoryPlugin />
        { isActive && debug && <TreeViewPlugin /> }
        <TabIndentationPlugin />
      </div>
    </div>
  );
}
