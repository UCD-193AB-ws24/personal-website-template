import { APIResponse } from "@customTypes/apiResponse";

export async function setUsernameCookie(username: string) {
  return fetch(`/api/user/set-username-cookie`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username }),
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
