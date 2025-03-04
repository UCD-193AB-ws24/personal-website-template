import { APIResponse, TemplateMapping } from '@customTypes/apiResponse';

export async function deleteTemplate(templateMapping: TemplateMapping) {
	return fetch(`/api/admin/templates/delete`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify(templateMapping),
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
