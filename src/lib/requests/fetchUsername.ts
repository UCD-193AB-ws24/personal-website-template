import { APIResponse } from '@customTypes/apiResponse';

// Request memoization: https://nextjs.org/docs/app/building-your-application/caching#request-memoization
export async function fetchUsername() {
	try {
		const response = await fetch('/api/user/username', {
			headers: {
				'Content-Type': 'application/json',
			},
		});

		const resBody = (await response.json()) as APIResponse<string>;

		if (response.ok && resBody.success) {
			return resBody.data;
		} else {
			throw new Error('Unknown username');
		}
	} catch (error: any) {
		console.log(error.message);
		return "";
	}
}
