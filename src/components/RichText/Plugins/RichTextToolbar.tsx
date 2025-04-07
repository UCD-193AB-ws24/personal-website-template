import {useLexicalComposerContext} from '@lexical/react/LexicalComposerContext';
import {mergeRegister} from '@lexical/utils';
import {INSERT_UNORDERED_LIST_COMMAND, INSERT_ORDERED_LIST_COMMAND} from '@lexical/list';
import {TOGGLE_LINK_COMMAND} from '@lexical/link'
import {
  $getSelection,
  $isRangeSelection,
  $isTextNode,
  CAN_REDO_COMMAND,
  CAN_UNDO_COMMAND,
  createCommand,
  FORMAT_ELEMENT_COMMAND,
  FORMAT_TEXT_COMMAND,
  LexicalCommand,
  REDO_COMMAND,
  SELECTION_CHANGE_COMMAND,
  UNDO_COMMAND,
} from 'lexical';
import {useCallback, useEffect, useRef, useState} from 'react';
import { Plus, Minus, Undo, Redo, Bold, Italic, Underline, Strikethrough, AlignLeft, AlignCenter, AlignRight, List, ListOrdered, LucideLink} from 'lucide-react';
// ^^ need a plus and minus for increase decrease font
import { toastError } from '@components/toasts/ErrorToast';


const fontSizes = ['12px', '16px', '18px', '20px', '24px', '30px', '36px', '42px', '48px', '60px', '72px']
const LowPriority = 1;

function Divider() {
  return <div className="divider" />;
}

const SET_FONT_SIZE_COMMAND: LexicalCommand<string> = createCommand();

export default function RichTextToolbarPlugin() {
  const [editor] = useLexicalComposerContext();
  const toolbarRef = useRef(null);
  const [canUndo, setCanUndo] = useState(false);
  const [canRedo, setCanRedo] = useState(false);
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [isStrikethrough, setIsStrikethrough] = useState(false);
  // add const for setting font size (set a default size too)
  const [fontSize, setFontSize] = useState('16px');

  // Adapted from https://github.com/facebook/lexical/blob/83205d80a072e76bc56effd78113a0ee99c5306f/packages/lexical-playground/src/utils/url.ts#L1
  const isValidURL = (url: string): string => {
    const SUPPORTED_URL_PROTOCOLS = new Set([
      'http:',
      'https:',
      'mailto:',
      'sms:',
      'tel:',
    ]);

    try {
      const parsedURL = new URL(url);
      if (!SUPPORTED_URL_PROTOCOLS.has(parsedURL.protocol)) {
        toastError("Selected text must include one of the following protocols: http, https, mailto, sms, tel.");
        return "";
      }
    } catch {
      toastError("Selected text is not a valid URL. Ensure that a protocol is provided. Example: https://example.com");
      return "";
    }

    // Source: https://stackoverflow.com/a/8234912/2013580
    const urlRegExp = new RegExp(
      /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[\w]*))?)/,
    );

    if (!urlRegExp.test(url)) {
      toastError("Selected text is not a valid URL.");
      return "";
    }

    return url;
  }

  const $updateToolbar = useCallback(() => {
    const selection = $getSelection();
    if ($isRangeSelection(selection)) {

      console.log("hello");

      // Update text format
      setIsBold(selection.hasFormat('bold'));
      setIsItalic(selection.hasFormat('italic'));
      setIsUnderline(selection.hasFormat('underline'));
      setIsStrikethrough(selection.hasFormat('strikethrough'));

      // Update font size
      const nodes = selection.getNodes();
      let fontSizeFound: string | null = null;
      let hasMixedFontSizes = false;
  
      for (const node of nodes) {
        if ($isTextNode(node)) {
          console.log("is text node");

          const style = node.getStyle();
          const match = style?.match(/font-size:\s*([^\s;]+)/);
          const currentFontSize = match?.[1] || null;

          console.log("node: ", node);
          console.log("match: " + match);
          console.log("cur size: " + currentFontSize);

          if (fontSizeFound === null) {
            fontSizeFound = currentFontSize;
          } else if (fontSizeFound !== currentFontSize) {
            hasMixedFontSizes = true;
            break;
          }
        }
      }
  
      if (hasMixedFontSizes) {
        setFontSize('   ');
      } else {
        setFontSize(fontSizeFound || fontSize);
      }
    }

  }, [fontSize]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({editorState}) => {
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
      // BUG: it's modifying text that wasn't selected...
      editor.registerCommand(
        SET_FONT_SIZE_COMMAND,
        (size: string) => {
          editor.update(() => {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              selection.getNodes().forEach(node => {
                if ($isTextNode(node)) {
                  node.setStyle('font-size: ' + size);
                }
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
    <div className="toolbar absolute top-[0px] z-[100]" ref={toolbarRef}>
      <button
        disabled={!canUndo}
        onClick={() => {
          editor.dispatchCommand(UNDO_COMMAND, undefined);
        }}
        className="toolbar-item spaced"
        aria-label="Undo">
        <Undo className="format undo" />
      </button>
      <button
        disabled={!canRedo}
        onClick={() => {
          editor.dispatchCommand(REDO_COMMAND, undefined);
        }}
        className="toolbar-item"
        aria-label="Redo">
        <Redo className="format redo" />
      </button>
      <Divider />

      <div className="flex justify-evenly items-center">

        {/* Add functionality for increase decrease font size*/}

        {/* Decrease button */}
        {/* Disable if size is less than [x size] */}
        <button
          disabled={fontSizes.indexOf(fontSize) === 0}
          onClick={() => {
            console.log("decreasing font size to " + fontSizes[fontSizes.indexOf(fontSize) - 1]);
            setFontSize(fontSizes[fontSizes.indexOf(fontSize) - 1]);
            console.log("new size: " + fontSize);
            editor.dispatchCommand(SET_FONT_SIZE_COMMAND, fontSizes[fontSizes.indexOf(fontSize) - 1]);
          }}
        >
          <Minus className="format"/>
        </button>

        {/* Font Size Label */}
        <h1>{ fontSize }</h1>

        {/* Increase button */}
        {/* Disable if size is more than [y size] */}
        <button
          disabled={fontSizes.indexOf(fontSize) === (fontSizes.length - 1)}
          onClick={() => {
            console.log("increasing font size to " + fontSizes[fontSizes.indexOf(fontSize) + 1]);
            setFontSize(fontSizes[fontSizes.indexOf(fontSize) + 1]);
            console.log("new size: " + fontSize);
            editor.dispatchCommand(SET_FONT_SIZE_COMMAND, fontSizes[fontSizes.indexOf(fontSize) + 1]);
          }}
        >
          <Plus className="format"/>
        </button>
      </div>

      <Divider />
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
        }}
        className={'toolbar-item spaced ' + (isBold ? 'active' : '')}
        aria-label="Format Bold">
        <Bold className="format bold" />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
        }}
        className={'toolbar-item spaced ' + (isItalic ? 'active' : '')}
        aria-label="Format Italics">
        <Italic className="format italic" />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
        }}
        className={'toolbar-item spaced ' + (isUnderline ? 'active' : '')}
        aria-label="Format Underline">
        <Underline className="format underline" />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
        }}
        className={'toolbar-item spaced ' + (isStrikethrough ? 'active' : '')}
        aria-label="Format Strikethrough">
        <Strikethrough className="format strikethrough" />
      </button>
      <Divider />
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left');
        }}
        className="toolbar-item spaced"
        aria-label="Left Align">
        <AlignLeft className="format left-align" />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center');
        }}
        className="toolbar-item spaced"
        aria-label="Center Align">
        <AlignCenter className="format center-align" />
        
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right');
        }}
        className="toolbar-item spaced"
        aria-label="Right Align">
        <AlignRight className="format right-align" />
      </button>
      <button
        onClick={() => {
          editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
        }}
        className="toolbar-item spaced"
        aria-label="Insert ordered list">
        <ListOrdered className="format justify-align" />
      </button>{' '}
      <button
        onClick={() => {
          editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
        }}
        className="toolbar-item spaced"
        aria-label="Insert unordered list">
        <List className="format justify-align" />
      </button>{' '}
      <button
        onClick={() => {
          editor.update(() => {
            const selection = $getSelection();
            if (selection) {
              if (selection.getTextContent().length === 0) {
                return;
              }

              if (isValidURL(selection.getTextContent())) {
                editor.dispatchCommand(TOGGLE_LINK_COMMAND, selection.getTextContent());
              }
            }
          })
        }}
        className="toolbar-item spaced"
        aria-label="Insert unordered list">
        <LucideLink className="format justify-align" />
      </button>{' '}
    </div>
  );
}
