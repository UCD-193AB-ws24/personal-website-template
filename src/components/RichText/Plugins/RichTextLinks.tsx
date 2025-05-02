"use client";

/* eslint-disable react-hooks/exhaustive-deps */
import {
  $createTextNode,
  $getSelection,
  $isRangeSelection,
  CLICK_COMMAND,
  KEY_ESCAPE_COMMAND,
  NodeKey,
} from "lexical";
import { $findMatchingParent, mergeRegister } from "@lexical/utils";
import { useEffect, useRef, useState } from "react";
import { $createLinkNode, $isLinkNode } from "@lexical/link";

import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { getSelectedNode } from "@components/RichText/utils/getSelectedNode";
import { Position } from "@customTypes/componentTypes";
import { Text, Search } from "lucide-react";
import isValidURL from "@components/RichText/utils/isValidURL";
import { useEditorContext } from "@contexts/EditorContext";
import { useRouter, usePathname } from "next/navigation";
import { usePublishContext } from "@contexts/PublishContext";
import { usePagesContext } from "@contexts/PagesContext";

const LowPriority = 1;

interface RichTextLinksProps {
  isActive: boolean;
  isPreview: boolean;
}

export default function RichTextLinks({
  isActive,
  isPreview,
}: RichTextLinksProps) {
  const pathName = usePathname();
  const editorContext = useEditorContext();
  const pagesContext = usePagesContext();

  const publishContext = usePublishContext();
  const router = useRouter();

  const [editor] = useLexicalComposerContext();
  const linkEditorRef = useRef<HTMLDivElement | null>(null);

  // Should find a better solution than having a hard-coded width
  // Using linkEditorRef.current.clientWidth doesn't work since hiding
  // the link editor causes the width to be 0
  const linkEditorWidth = 430;

  const [isLinkEditorVisible, setIsLinkEditorVisible] = useState(false);
  const [linkEditorPosition, setLinkEditorPosition] = useState<Position>({
    x: 0,
    y: 0,
  });
  const [linkEditorTextField, setLinkEditorTextField] = useState("");
  const [linkEditorURLField, setLinkEditorURLField] = useState("");
  const [lastActiveLinkNodeKey, setLastActiveLinkNodeKey] =
    useState<NodeKey>("");
  const [escapePressed, setEscapePressed] = useState(false);

  // Using refs inside the useEffect's dependency list since using state variables
  // in the dependency list causes the lexical editor to defocus on change
  const lastActiveLinkNodeKeyRef = useRef(lastActiveLinkNodeKey);
  const escapePressedRef = useRef(escapePressed);
  const isActiveRef = useRef(isActive);

  // Update refs whenever their corresponding state variable updates
  useEffect(() => {
    lastActiveLinkNodeKeyRef.current = lastActiveLinkNodeKey;
  }, [lastActiveLinkNodeKey]);

  useEffect(() => {
    escapePressedRef.current = escapePressed;
  }, [escapePressed]);

  useEffect(() => {
    isActiveRef.current = isActive;
    if (!isActive) {
      setIsLinkEditorVisible(false);
    }
  }, [isActive]);

  useEffect(() => {
    return mergeRegister(
      editor.registerUpdateListener(({ editorState }) => {
        editorState.read(() => {
          if (isPreview) {
            return;
          }

          const selection = $getSelection();
          if ($isRangeSelection(selection)) {
            const node = getSelectedNode(selection);
            const linkParent = $findMatchingParent(node, $isLinkNode);
            if (linkParent) {
              const element = editor.getElementByKey(node.getKey());
              const dropzone = document.getElementById("editor-drop-zone");

              if (element && dropzone) {
                const elementRect = element.getBoundingClientRect();
                const dropzoneRect = dropzone.getBoundingClientRect();

                // When text wraps, the element.offsetLeft property doesn't return
                // the leftmost edge
                // The elementRect.left property does return the leftmost edge
                const offsetParent = element.offsetParent;
                const trueOffsetLeft =
                  elementRect.left - offsetParent!.getBoundingClientRect().left;

                if (elementRect.left + linkEditorWidth > dropzoneRect.right) {
                  const overflowX =
                    elementRect.left + linkEditorWidth - dropzoneRect.right;
                  setLinkEditorPosition({
                    x: trueOffsetLeft - overflowX,
                    y: element.offsetTop + element.offsetHeight + 4,
                  });
                } else {
                  setLinkEditorPosition({
                    x: trueOffsetLeft,
                    y: element.offsetTop + element.offsetHeight + 4,
                  });
                }
              }

              // If the user clicks escape while editing a link, we want
              // to hide the link editor until the user clicks on another node
              // and then clicks back on the link
              if (!escapePressedRef.current) {
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
              setEscapePressed(false);
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
      // Custom handler for clicking relative links
      editor.registerCommand(
        CLICK_COMMAND,
        (payload) => {
          const target = payload.target as HTMLElement;

          // Check that the user clicked a link
          if (target.parentElement?.tagName === "A") {
            // Get the link node to get the URL
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
              const node = getSelectedNode(selection);
              const linkParent = $findMatchingParent(node, $isLinkNode);

              if (linkParent) {
                payload.preventDefault();
                const linkParentURL = linkParent.getURL();
                const pageIdx = getPageIdx(linkParentURL);

                if (pageIdx !== -1) {
                  // Handle relative links
                  if (publishContext.isPublish) {
                    // Redirect to the linked page
                    const urlFriendlyPageName = encodeURIComponent(
                      linkParentURL.replace(/ /g, "-"),
                    );
                    const redirectPath =
                      getPublishedRedirectPath(urlFriendlyPageName);
                    router.push(redirectPath);
                    return true;
                  } else {
                    // Handle relative links using handleSwitchPage function
                    editorContext!.handleSwitchPage(pageIdx);
                    return true;
                  }
                } else {
                  // Handle outside links
                  window.open(linkParentURL, "_blank")?.focus();
                  return true;
                }
              }
            }
          }
          return false;
        },
        LowPriority,
      ),
    );
  }, [editor, lastActiveLinkNodeKeyRef, escapePressedRef]);

  const getPageIdx = (name: string): number => {
    for (let i = 0; i < pagesContext.pages.length; i++) {
      if (pagesContext.pages[i].pageName === name) {
        return i;
      }
    }

    return -1;
  };

  // In a published page, relative links should redirect to
  // /pages/[username]/[pageName]
  const getPublishedRedirectPath = (pageName: string) => {
    const pathParts = pathName.split("/");
    const pagesIdx = pathParts.indexOf("pages");
    const usernameIdx = pagesIdx + 1;
    if (pagesIdx === -1 || usernameIdx >= pathParts.length) {
      console.error(
        "Relative link is used in a published context that doesn't follow the /pages/username convention",
      );
      return "";
    }

    const redirectPathParts = pathParts.slice(0, usernameIdx + 1);
    redirectPathParts.push(pageName);

    return redirectPathParts.join("/");
  };

  const updateLink = () => {
    if (
      getPageIdx(linkEditorURLField) !== -1 ||
      isValidURL(linkEditorURLField)
    ) {
      setIsLinkEditorVisible(false);
      setEscapePressed(true);

      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          const node = getSelectedNode(selection);
          const linkParent = $findMatchingParent(node, $isLinkNode);

          if (linkParent) {
            setLastActiveLinkNodeKey(linkParent.getKey());

            // Replace the old link with a new link node containing the entered fields
            const newLink = $createLinkNode(linkEditorURLField);
            newLink.append($createTextNode(linkEditorTextField));

            linkParent.replace(newLink);
            newLink.select(0);
          }
        }
      });
    }
  };

  return (
    <div
      ref={linkEditorRef}
      className="absolute z-[10000] gap-[4px] p-2 bg-white shadow-[0px_0px_37px_-14px_rgba(0,_0,_0,_1)] rounded-md"
      style={{
        display: `${isLinkEditorVisible ? "flex" : "none"}`,
        left: linkEditorPosition.x,
        top: linkEditorPosition.y,
      }}
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
          onKeyUp={(e) => {
            // Enter key pressed
            if (e.key === "Enter") {
              updateLink();
            }
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
          onKeyUp={(e) => {
            // Enter key is pressed
            if (e.key === "Enter") {
              updateLink();
            }
          }}
        />
      </div>
      <button
        className="text-sm text-blue-500 font-bold ml-[16px]"
        onClick={() => {
          updateLink();
        }}
      >
        Apply
      </button>
    </div>
  );
}
