import { APIResponse } from "@customTypes/apiResponse";

export async function deleteAccountFirebase() {
  return fetch(`/api/user/delete-account`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
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
