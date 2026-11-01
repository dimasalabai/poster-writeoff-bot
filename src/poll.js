// Пошук нових списань одного акаунта й побудова повідомлень.
import { posterRequest, formatPosterDate } from "./clients/poster.js";
import { loadDictionaries, normalizeWaste } from "./wastes.js";
import { formatMessage } from "./message.js";

const LOOKBACK_DAYS = 7;
const DAY_MS = 24 * 60 * 60 * 1000;

// Список списань за останні дні, від старих до нових (за waste_id).
export async function fetchRecentWastes(token, now = new Date()) {
	const from = new Date(now.getTime() - LOOKBACK_DAYS * DAY_MS);
	const to = new Date(now.getTime() + DAY_MS);

	const list = await posterRequest(token, "storage.getWastes", {
		dateFrom: formatPosterDate(from),
		dateTo: formatPosterDate(to),
	});
	if (!Array.isArray(list)) {
		throw new Error("storage.getWastes: очікувався масив");
	}

	return list
		.filter((w) => Number(w.delete ?? 0) === 0)
		.sort((a, b) => Number(a.waste_id) - Number(b.waste_id));
}

// Лишає тільки ті записи, яких ще немає серед оброблених.
export function pickNew(wastes, seenIds) {
	return wastes.filter((w) => !seenIds.has(String(w.waste_id)));
}

// Для нових списань: деталі + довідники -> готові тексти повідомлень.
export async function buildMessages(account, newWastes) {
	if (newWastes.length === 0) return [];

	const dict = await loadDictionaries(account.token);
	const messages = [];

	for (const short of newWastes) {
		const full = await posterRequest(account.token, "storage.getWaste", {
			waste_id: short.waste_id,
		});
		messages.push({
			id: String(short.waste_id),
			text: formatMessage(account.name, normalizeWaste(full, dict)),
		});
	}

	return messages;
}
