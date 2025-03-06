import { APIResponse, TemplateMapping } from '@customTypes/apiResponse';

export async function renameTemplate(
	templateMapping: TemplateMapping,
	newName: string
) {
	return fetch(`/api/admin/templates/rename`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({
			newName,
			oldName: templateMapping.name,
			number: templateMapping.number,
		}),
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
