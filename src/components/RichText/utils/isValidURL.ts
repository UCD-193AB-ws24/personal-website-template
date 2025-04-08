import { toastError } from "@components/toasts/ErrorToast";

// Adapted from https://github.com/facebook/lexical/blob/83205d80a072e76bc56effd78113a0ee99c5306f/packages/lexical-playground/src/utils/url.ts#L1
export default function isValidURL(url: string): string {
	const SUPPORTED_URL_PROTOCOLS = new Set([
		'http:',
		'https:',
		'mailto:',
		'sms:',
		'tel:',
	]);

	try {
		const parsedURL = new URL(url);
		if (!SUPPORTED_URL_PROTOCOLS.has(parsedURL.protocol)) {
			toastError("Selected text must include one of the following protocols: http, https, mailto, sms, tel.");
			return "";
		}
	} catch {
		toastError("Selected text is not a valid URL. Ensure that a protocol is provided. Example: https://example.com");
		return "";
	}

	// Source: https://stackoverflow.com/a/8234912/2013580
	const urlRegExp = new RegExp(
		/((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=+$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=+$,\w]+@)[A-Za-z0-9.-]+)((?:\/[+~%/.\w-_]*)?\??(?:[-+=&;%@.\w_]*)#?(?:[\w]*))?)/,
	);

	if (!urlRegExp.test(url)) {
		toastError("Selected text is not a valid URL.");
		return "";
	}

	return url;
}
