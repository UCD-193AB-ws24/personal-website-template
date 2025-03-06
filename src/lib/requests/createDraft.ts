import { APIResponse } from "@customTypes/apiResponse";

export async function createDraft(
  timestamp: number,
  draftName?: string,
  templateNumber?: number,
) {
  return fetch(`/api/user/update-drafts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ timestamp, name: draftName, templateNumber }),
  })
    .then((res) => res.json())
    .then((res: APIResponse<string>) => {
      if (!res.success) {
        throw new Error(res.error);
      } else {
        return true;
      }
    })
    .catch((error) => {
      console.log(error.message);
      return false;
    });
}
