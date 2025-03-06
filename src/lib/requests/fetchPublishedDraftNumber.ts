import { APIResponse } from "@customTypes/apiResponse";

export async function fetchPublishedDraftNumber() {
  return fetch("/api/user/publish-draft", {
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((res: APIResponse<number>) => {
      if (!res.success) {
        throw new Error(res.error);
      } else {
        return res.data;
      }
    })
    .catch((error) => {
      console.log(error.message);
      return 0;
    });
}
