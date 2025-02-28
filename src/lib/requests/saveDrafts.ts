import { Page } from '@customTypes/componentTypes';
import { APIResponse } from '@customTypes/apiResponse';

export async function saveDraft(
	draftNumber: number,
	pages: Page[]
) {
	try {
		const res = await fetch(`/api/db/drafts?draftNumber=${draftNumber}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ pages }),
		});
		const resBody = (await res.json()) as APIResponse<string>;

		if (res.ok && resBody.success) {
			return '';
		}

		throw new Error('Bad request');
	} catch (error: any) {
		console.log('Error:', error.message);
		return error.message;
	}
}
