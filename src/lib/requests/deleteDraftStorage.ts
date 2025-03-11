import { getStorage, ref, listAll, deleteObject } from "firebase/storage";

// Delete all files inside a Firebase Storage directory
export const deleteDraftStorage = async (
  userId: string,
  draftNumber: number,
) => {
  const storage = getStorage();
  const dirRef = ref(storage, `users/${userId}/drafts/${draftNumber}/`);

  try {
    const files = await listAll(dirRef);
    const deletePromises = files.items.map((fileRef) => deleteObject(fileRef));

    await Promise.all(deletePromises);
  } catch (error) {
    console.error("Error deleting draft storage:", error);
  }
};
