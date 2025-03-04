import { listAll, ref, deleteObject } from "firebase/storage";
import { storage } from "@lib/firebase/firebaseApp";

// Fetches all images stored in Firebase for the draft
// and determines which images are still referenced in the draft's components.
const fetchStoredAndReferencedImages = async (userId: string, draftNumber: string, pages: any[]) => {
  const draftStorageRef = ref(storage, `users/${userId}/drafts/${draftNumber}/`);

  const storedFiles = await listAll(draftStorageRef);
  const storedImagePaths = storedFiles.items.map((file) => file.fullPath); // Paths of stored images

  const activeImagePaths = new Set(
    pages.flatMap((page) =>
      page.components
        .filter((comp: any) => comp.type === "image" && comp.content)
        .map((comp: any) => {
          const url = new URL(comp.content);
          const storagePath = decodeURIComponent(url.pathname.replace("/v0/b/" + storage.app.options.storageBucket + "/o/", ""));
          return storagePath;
        })
    )
  );

  return { storedImagePaths, activeImagePaths };
};

export const deleteUnusedDraftImages = async (userId: string, draftNumber: string, updatedPages: any[]) => {
  try {
    const { storedImagePaths, activeImagePaths } = await fetchStoredAndReferencedImages(userId, draftNumber, updatedPages);

    // Find images that are stored but NOT referenced in components
    const unusedImages = storedImagePaths.filter((path) => !activeImagePaths.has(path));

    if (unusedImages.length === 0) return;

    // Delete each unused image from Firebase Storage
    await Promise.all(
      unusedImages.map(async (path) => {
        const imageRef = ref(storage, path);
        await deleteObject(imageRef)
          .catch((error) => console.error("Error deleting image:", error));
      })
    );

  } catch (error) {
    console.error("Failed to delete unused draft images:", error);
  }
};

