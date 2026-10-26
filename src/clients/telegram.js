// Мінімальний клієнт Telegram Bot API.

const API = "https://api.telegram.org";

export async function telegramRequest(token, method, body = {}) {
	const response = await fetch(`${API}/bot${token}/${method}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
		signal: AbortSignal.timeout(15_000),
	});

	let data = null;
	try {
		data = await response.json();
	} catch {
		// відповідь не JSON, обробимо нижче
	}

	if (!response.ok || !data?.ok) {
		const error = new Error(
			`Telegram ${method}: HTTP ${response.status}, ${data?.description ?? "без опису"}`,
		);
		error.status = response.status;
		error.retryAfter = data?.parameters?.retry_after;
		throw error;
	}

	return data.result;
}

export function sendMessage(token, chatId, text) {
	return telegramRequest(token, "sendMessage", {
		chat_id: chatId,
		text,
		disable_web_page_preview: true,
	});
}
