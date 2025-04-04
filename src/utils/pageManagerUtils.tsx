import { toast, Flip } from "react-toastify";

import type { ComponentItem, Page } from "@customTypes/componentTypes";

// Switch to another page, saving the current page's components before switching.
export const switchPage = (
  pageIndex: number,
  activePageIndex: number | null,
  pages: Page[],
  setPages: React.Dispatch<React.SetStateAction<Page[]>>,
  components: ComponentItem[],
  setComponents: React.Dispatch<React.SetStateAction<ComponentItem[]>>,
  setActiveComponent: React.Dispatch<
    React.SetStateAction<ComponentItem | null>
  >,
  setActivePageIndex: React.Dispatch<React.SetStateAction<number | null>>,
) => {
  if (activePageIndex == null) return;
  if (activePageIndex === pageIndex) return;

  setPages((prevPages) => {
    const updatedPages = [...prevPages];
    updatedPages[activePageIndex].components = components;
    setComponents(updatedPages[pageIndex]?.components || []);
    return updatedPages;
  });

  setActivePageIndex(pageIndex);
  setActiveComponent(null);
};

// Updates a page's name in the navigation bar.
export const updatePageName = (
  pageIndex: number,
  newName: string,
  setPages: React.Dispatch<React.SetStateAction<Page[]>>,
) => {
  setPages((prevPages) => {
    const updatedPages = [...prevPages];
    updatedPages[pageIndex].pageName = newName;
    return updatedPages;
  });
};

// Adds a new page, ensuring unique names (e.g., "New Page", "New Page 2").
export const addPage = (
  activePageIndex: number | null,
  components: ComponentItem[],
  setPages: React.Dispatch<React.SetStateAction<Page[]>>,
  setActivePageIndex: React.Dispatch<React.SetStateAction<number | null>>,
  setComponents: React.Dispatch<React.SetStateAction<ComponentItem[]>>,
) => {
  setPages((prevPages) => {
    if (activePageIndex !== null) {
      prevPages[activePageIndex].components = [...components];
    }

    // Generate unique page name
    const existingNames = new Set(prevPages.map((page) => page.pageName));
    let counter = 2;
    let newPageName = "New Page";
    while (existingNames.has(newPageName)) {
      newPageName = `New Page ${counter++}`;
    }

    const updatedPages = [
      ...prevPages,
      { pageName: newPageName, components: [] },
    ];

    setActivePageIndex(updatedPages.length - 1);
    setComponents([]);

    return updatedPages;
  });
};

// Deletes a page, confirming first if it has multiple components.
export const deletePage = (
  pageIndex: number,
  activePageIndex: number | null,
  pages: Page[],
  components: ComponentItem[],
  setPages: React.Dispatch<React.SetStateAction<Page[]>>,
  setActivePageIndex: React.Dispatch<React.SetStateAction<number | null>>,
  setComponents: React.Dispatch<React.SetStateAction<ComponentItem[]>>,
) => {
  if (activePageIndex == null) return;

  setPages((prevPages) => {
    const updatedPages = [...prevPages];
    updatedPages[activePageIndex].components = components;
    return updatedPages;
  });

  const pageToDelete = pages[pageIndex];

  if (pageToDelete.components.length > 1) {
    toast(
      <div className="flex flex-col">
        <h3 className="font-semibold text-lg text-yellow-500"> Warning </h3>
        <p className="text-sm">Are you sure you want to delete this page?</p>
        <div className="flex justify-between mt-4">
          <button
            className="flex-1 bg-gray-200 text-gray-800 px-4 py-2 rounded-md hover:bg-gray-300 transition"
            onClick={() => toast.dismiss()}
          >
            Cancel
          </button>
          <button
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition ml-3"
            onClick={() => {
              toast.dismiss();
              confirmDelete(
                pageIndex,
                activePageIndex,
                setPages,
                setActivePageIndex,
                setComponents,
              );
            }}
          >
            Yes, Delete
          </button>
        </div>
      </div>,
      {
        position: "top-center",
        autoClose: false,
        closeOnClick: false,
        draggable: false,
        closeButton: false,
        transition: Flip,
      },
    );
    return;
  }
  confirmDelete(
    pageIndex,
    activePageIndex,
    setPages,
    setActivePageIndex,
    setComponents,
  );
};

/**
 * Confirms deletion of a page and updates state.
 */
export const confirmDelete = (
  pageIndex: number,
  activePageIndex: number | null,
  setPages: React.Dispatch<React.SetStateAction<Page[]>>,
  setActivePageIndex: React.Dispatch<React.SetStateAction<number | null>>,
  setComponents: React.Dispatch<React.SetStateAction<ComponentItem[]>>,
) => {
  if (activePageIndex == null) return;

  setPages((prevPages) => {
    const updatedPages = [...prevPages];
    updatedPages.splice(pageIndex, 1); // Remove the selected page

    let newActiveIndex = activePageIndex;

    // Shift active page index if the deleted page was active
    if (activePageIndex >= updatedPages.length) {
      newActiveIndex = updatedPages.length - 1;
    } else if (activePageIndex === pageIndex) {
      newActiveIndex = Math.max(0, pageIndex - 1);
    }

    setActivePageIndex(newActiveIndex);
    setComponents(updatedPages[newActiveIndex]?.components || []);

    return updatedPages;
  });
};
