// Складає текст повідомлення для Telegram.

// Poster API після переходу на зимовий час (25.10.2026) віддає час на годину
// пізніше, ніж показує адмінка. Навесні, коли годинники переведуть, поставити 0.
const HOUR_CORRECTION = -1;

const MAX_ITEMS = 30; // ліміт Telegram: 4096 символів на повідомлення

function formatTime(text) {
	const date = new Date(String(text).replace(" ", "T") + "Z");
	if (Number.isNaN(date.getTime())) return String(text);

	date.setUTCHours(date.getUTCHours() + HOUR_CORRECTION);
	const p = (n) => String(n).padStart(2, "0");
	return (
		`${p(date.getUTCDate())}.${p(date.getUTCMonth() + 1)}.${date.getUTCFullYear()}, ` +
		`${p(date.getUTCHours())}:${p(date.getUTCMinutes())}`
	);
}

const formatNumber = (n) =>
	n.toLocaleString("uk-UA", { maximumFractionDigits: 3 });

const formatMoney = (n) =>
	n.toLocaleString("uk-UA", {
		minimumFractionDigits: 2,
		maximumFractionDigits: 2,
	});

export function formatMessage(accountName, waste) {
	const itemLines = waste.items
		.slice(0, MAX_ITEMS)
		.map(
			(item, i) =>
				`${i + 1}. ${item.name} — ${formatNumber(item.quantity)} ${item.unit}`,
		);

	if (waste.items.length > MAX_ITEMS) {
		itemLines.push(`…і ще ${waste.items.length - MAX_ITEMS} поз.`);
	}
	if (itemLines.length === 0) {
		itemLines.push("не вдалося визначити");
	}

	return [
		"⚠️ Нове списання в Poster",
		"",
		`Заклад: ${accountName}`,
		`Дата й час: ${formatTime(waste.date)}`,
		`Співробітник: ${waste.employee}`,
		`Причина: ${waste.reason ?? "не вказана"}`,
		`Сума списання: ${formatMoney(waste.totalUah)} грн`,
		"",
		"Позиції:",
		...itemLines,
	].join("\n");
}
