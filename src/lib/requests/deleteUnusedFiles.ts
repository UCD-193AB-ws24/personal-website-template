import { listAll, ref, deleteObject } from "firebase/storage";
// import { storage } from "@lib/firebase/firebaseApp";
import { getFirebaseStorage } from "@lib/firebase/firebaseApp";
const storage = getFirebaseStorage();

// Fetches all files stored in Firebase for the draft
// and determines which files are still referenced in the draft's components.
const fetchStoredAndReferencedFiles = async (
  userId: string,
  draftNumber: string,
  pages: any[],
) => {
  const draftStorageRef = ref(
    storage,
    `users/${userId}/drafts/${draftNumber}/`,
  );

  const storedFiles = await listAll(draftStorageRef);
  const storedImagePaths = storedFiles.items.map((file) => file.fullPath); // Paths of stored images

  const getStoragePathFromUrl = (urlString: string): string | null => {
    try {
      const url = new URL(urlString);
      return decodeURIComponent(
        url.pathname.replace(
          `/v0/b/${storage.app.options.storageBucket}/o/`,
          "",
        ),
      );
    } catch {
      return null;
    }
  };

  const activeImagePaths = new Set(
    pages.flatMap((page) =>
      page.components
        .filter(
          (comp: any) =>
            (comp.type === "image" ||
              comp.type === "file" ||
              comp.type === "aboutMeCard" ||
              comp.type === "projectCard") &&
            comp.content,
        )
        .flatMap((comp: any) => {
          try {
            if (comp.type === "aboutMeCard") {
              return comp.content
                ? [getStoragePathFromUrl(comp.content.image)]
                : [];
            }

            if (comp.type === "projectCard") {
              const cards = JSON.parse(comp.content);
              return cards
                .filter((card: any) => card.type === "image" && card.imageUrl)
                .map((card: any) => getStoragePathFromUrl(card.imageUrl));
            }

            if (comp.type === "image") {
              const imageUrl =
                typeof comp.content === "string"
                  ? comp.content
                  : comp.content?.image;

              return imageUrl ? [getStoragePathFromUrl(imageUrl)] : [];
            }

            // default for image or file: content is a string URL
            return [getStoragePathFromUrl(comp.content)];
          } catch {
            return [];
          }
        }),
    ),
  );

  return { storedImagePaths, activeImagePaths };
};

export const deleteUnusedDraftFiles = async (
  userId: string,
  draftNumber: string,
  updatedPages: any[],
) => {
  try {
    const { storedImagePaths, activeImagePaths } =
      await fetchStoredAndReferencedFiles(userId, draftNumber, updatedPages);

    // Find images that are stored but NOT referenced in components
    const unusedImages = storedImagePaths.filter(
      (path) => !activeImagePaths.has(path),
    );

    if (unusedImages.length === 0) return;

    // Delete each unused image from Firebase Storage
    await Promise.all(
      unusedImages.map(async (path) => {
        const imageRef = ref(storage, path);
        await deleteObject(imageRef).catch((error) =>
          console.error("Error deleting image:", error),
        );
      }),
    );
  } catch (error) {
    console.error("Failed to delete unused draft images:", error);
  }
};
