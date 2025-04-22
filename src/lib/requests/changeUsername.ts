import { APIResponse } from "@customTypes/apiResponse";

export async function changeUsername(
  newUsername: string
) {
  return fetch(`/api/user/change-username`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ newUsername }),
  })
    .then((res) => res.json())
    .then((res: APIResponse<string>) => {
      if (!res.success) {
        throw new Error(res.error);
      } else {
        return "";
      }
    })
    .catch((error) => {
      return error.message;
    });
}
