// Одноразова перевірка: показує останні ручні списання одного акаунта.
// Запуск: npm run poster:probe -- 1        (акаунт 1, останні 7 днів)
//         npm run poster:probe -- 1 30     (акаунт 1, останні 30 днів)
import { posterRequest, formatPosterDate } from "../src/clients/poster.js";

const accountNumber = process.argv[2] ?? "1";
const days = Number(process.argv[3] ?? 7);

const token = process.env[`POSTER_${accountNumber}_TOKEN`]?.trim();
const name =
	process.env[`POSTER_${accountNumber}_NAME`]?.trim() ??
	`акаунт ${accountNumber}`;

if (!token) {
	console.error(`POSTER_${accountNumber}_TOKEN не задано в .env`);
	process.exit(1);
}

const now = new Date();
const from = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

try {
	console.log(`Акаунт: ${name}. Період: останні ${days} дн.\n`);

	const wastes = await posterRequest(token, "storage.getWastes", {
		dateFrom: formatPosterDate(from),
		dateTo: formatPosterDate(now),
	});

	console.log(`Знайдено списань: ${wastes.length}`);
	for (const w of wastes) {
		console.log(
			`waste_id=${w.waste_id}  date=${w.date}  user_id=${w.user_id}  storage_id=${w.storage_id}  ` +
				`reason=${w.reason_name}  total_sum=${w.total_sum}  delete=${w.delete}`,
		);
	}

	const latest = wastes.filter((w) => Number(w.delete) === 0).at(-1);
	if (!latest) {
		console.log(
			"\nНемає списань для деталізації. Збільште період або зробіть тестове списання.",
		);
		process.exit(0);
	}

	console.log(`\nДеталі останнього списання (waste_id=${latest.waste_id}):\n`);
	const details = await posterRequest(token, "storage.getWaste", {
		waste_id: latest.waste_id,
	});
	console.log(JSON.stringify(details, null, 2));
} catch (error) {
	console.error(error.message);
	process.exit(1);
}
