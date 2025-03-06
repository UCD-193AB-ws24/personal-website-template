import { APIResponse, TemplateMapping } from "@customTypes/apiResponse";

export async function fetchTemplateMappings() {
  return fetch(`/api/db/templates/get`, {
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((res) => res.json())
    .then((res: APIResponse<TemplateMapping[]>) => {
      if (!res.success) {
        throw new Error(res.error);
      } else {
        return res.data;
      }
    })
    .catch((error) => {
      console.log(error.message);
      return [];
    });
}
