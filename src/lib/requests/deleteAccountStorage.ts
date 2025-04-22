import { deleteDraftStorage } from "@lib/requests/deleteDraftStorage";

export async function deleteAccountStorage(userId: string) {
  fetch("/api/user/get-drafts", {
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((res) => {
      if (res.success) {
        res.data.forEach((mapping: { id: number; name: string }) => {
          deleteDraftStorage(userId, mapping.id);
        });
      } else {
        throw new Error(res.error);
      }
    })
    .catch((error) => {
      console.log(error.message);
    });
}
