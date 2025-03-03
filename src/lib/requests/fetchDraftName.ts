import { APIResponse } from '@customTypes/apiResponse';

export async function fetchDraftName(id: number) {
	return fetch(`/api/user/draft-name?id=${id}`, {
		headers: {
			'Content-Type': 'application/json',
		},
	})
		.then((res) => res.json())
		.then((res: APIResponse<string>) => {
			if (!res.success) {
				throw new Error(res.error);
			} else {
				return res.data;
			}
		})
		.catch((error) => {
			console.log(error.message);
			return '';
		});
}
