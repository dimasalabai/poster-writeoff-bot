// Показує текст повідомлення для одного списання. Нічого не надсилає.
// Запуск: npm run preview:message -- 1 4480
import { posterRequest } from "../src/clients/poster.js";
import { loadDictionaries, normalizeWaste } from "../src/wastes.js";
import { formatMessage } from "../src/message.js";

const accountNumber = process.argv[2] ?? "1";
const wasteId = process.argv[3];

const token = process.env[`POSTER_${accountNumber}_TOKEN`]?.trim();
const name =
	process.env[`POSTER_${accountNumber}_NAME`]?.trim() ??
	`акаунт ${accountNumber}`;

if (!token || !wasteId) {
	console.error(
		"Використання: npm run preview:message -- 1 4480 (і токен має бути в .env)",
	);
	process.exit(1);
}

try {
	const waste = await posterRequest(token, "storage.getWaste", {
		waste_id: wasteId,
	});
	const dict = await loadDictionaries(token);
	console.log(formatMessage(name, normalizeWaste(waste, dict)));
} catch (error) {
	console.error(error.message);
	process.exit(1);
}
