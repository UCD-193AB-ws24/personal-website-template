import { APIResponse } from "@customTypes/apiResponse";

export async function createTemplate(draftId: number, draftName: string) {
  return fetch(`/api/admin/templates/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: draftName, number: draftId }),
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
