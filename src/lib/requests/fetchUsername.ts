import { APIResponse } from '@customTypes/apiResponse';

// Request memoization: https://nextjs.org/docs/app/building-your-application/caching#request-memoization
export async function fetchUsername() {
	return fetch('/api/user/username', {
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

	// try {
	// 	const response = await fetch('/api/user/username', {
	// 		headers: {
	// 			'Content-Type': 'application/json',
	// 		},
	// 	});

	// 	const resBody = (await response.json()) as APIResponse<string>;

	// 	if (!response.ok) {
	// 		throw new Error('Bad request');
	// 	} else if (!resBody.success) {
	// 		throw new Error(resBody.error);
	// 	} else {
	// 		return resBody.data;
	// 	}
	// } catch (error: any) {
	// 	console.log(error.message);
	// 	return '';
	// }
}
