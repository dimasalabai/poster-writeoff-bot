// Мінімальний клієнт Poster API.

const API = "https://joinposter.com/api";

export async function posterRequest(token, method, params = {}) {
	const query = new URLSearchParams({ token, ...params });

	let response;
	try {
		response = await fetch(`${API}/${method}?${query}`, {
			signal: AbortSignal.timeout(20_000),
		});
	} catch (cause) {
		const error = new Error(
			`Poster ${method}: мережева помилка (${cause.name})`,
		);
		error.retryable = true;
		throw error;
	}

	let data = null;
	try {
		data = await response.json();
	} catch {
		// відповідь не JSON, обробимо нижче
	}

	if (!response.ok || data === null || data.error) {
		const detail = data?.message ?? data?.error ?? "без опису";
		const error = new Error(
			`Poster ${method}: HTTP ${response.status}, ${detail}`,
		);
		error.status = response.status;
		error.retryable = response.status >= 500 || response.status === 429;
		throw error;
	}

	return data.response;
}

export function formatPosterDate(date) {
	const y = date.getFullYear();
	const m = String(date.getMonth() + 1).padStart(2, "0");
	const d = String(date.getDate()).padStart(2, "0");
	return `${y}${m}${d}`;
}
