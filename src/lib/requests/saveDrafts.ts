import { Page } from '@customTypes/componentTypes';
import { APIResponse } from '@customTypes/apiResponse';

export async function saveDraft(draftNumber: number, pages: Page[]) {
	return fetch(`/api/db/drafts?draftNumber=${draftNumber}`, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
		},
		body: JSON.stringify({ pages }),
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
			console.log(error.message);
			return error.message;
		});
}
