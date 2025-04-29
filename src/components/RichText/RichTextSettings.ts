import { EditorThemeClasses } from "lexical";
import { ParagraphNode, TextNode } from "lexical";
import { HeadingNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { LinkNode } from "@lexical/link";

export const RichTextTheme: EditorThemeClasses = {
  code: "editor-code",
  heading: {
    h1: "RichTextbox-heading-h1",
    h2: "RichTextbox-heading-h2",
    h3: "RichTextbox-heading-h3",
    h4: "RichTextbox-heading-h4",
    h5: "RichTextbox-heading-h5",
  },
  link: "RichTextbox-link",
  list: {
    listitem: "RichTextbox-listItem",
    nested: {
      listitem: "RichTextbox-nestedListItem",
    },
    olDepth: [
      "RichTextbox-ol1",
      "RichTextbox-ol2",
      "RichTextbox-ol3",
      "RichTextbox-ol4",
      "RichTextbox-ol5",
    ],
    ol: "RichTextbox-ol",
    ul: "RichTextbox-ul",
    ulDepth: [
      "RichTextbox-ul1",
      "RichTextbox-ul2",
      "RichTextbox-ul3",
      "RichTextbox-ul4",
      "RichTextbox-ul5",
    ],
  },
  ltr: "RichTextbox-ltr",
  paragraph: "RichTextbox-paragraph",
  rtl: "RichTextbox-rtl",
  text: {
    bold: "RichTextbox-text-bold",
    italic: "RichTextbox-text-italic",
    overflowed: "RichTextbox-text-overflowed",
    strikethrough: "RichTextbox-text-strikethrough",
    underline: "RichTextbox-text-underline",
    underlineStrikethrough: "RichTextbox-text-underlineStrikethrough",
  },
};

export const RichTextInitialConfig = {
  namespace: "RichTextbox",
  nodes: [
    ParagraphNode,
    TextNode,
    ListNode,
    ListItemNode,
    LinkNode,
    HeadingNode,
  ],
  onError(error: Error) {
    throw error;
  },
  theme: RichTextTheme,
};

const BlankRichTextEditorState =
  '{"root":{"children":[{"children":[],"direction":null,"format":"","indent":0,"type":"paragraph","version":1,"textFormat":0,"textStyle":""}],"direction":null,"format":"","indent":0,"type":"root","version":1}}';

const BlankHeaderRichTextEditorState =
  '{"root":{"children":[{"children":[],"direction":null,"format":"bold","indent":0,"type":"heading","tag":"h1","version":1}],"direction":null,"format":"","indent":0,"type":"root","version":1}}';

export const RichTextDefaultContent = {
  textboxState: BlankRichTextEditorState,
  backgroundColor: "transparent",
};

export const HeaderRichTextDefaultContent = {
  textboxState: BlankHeaderRichTextEditorState,
  backgroundColor: "transparent",
};
