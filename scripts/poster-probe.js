// Одноразова перевірка: показує останні ручні списання одного акаунта.
// Запуск: npm run poster:probe -- 1              (акаунт 1, 7 днів, деталі найновішого)
//         npm run poster:probe -- 1 30           (акаунт 1, 30 днів)
//         npm run poster:probe -- 1 7 4481       (деталі конкретного waste_id)
import { posterRequest, formatPosterDate } from "../src/clients/poster.js";

const accountNumber = process.argv[2] ?? "1";
const days = Number(process.argv[3] ?? 7);
const wantedId = process.argv[4];

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
	console.log("Поля першого запису:", Object.keys(wastes[0] ?? {}).join(", "));

	// Поле delete може бути відсутнє: тоді вважаємо запис не видаленим.
	const active = wastes.filter((w) => Number(w.delete ?? 0) === 0);

	let target;
	if (wantedId) {
		target = active.find((w) => String(w.waste_id) === String(wantedId));
	} else {
		// Найновіше = з найбільшим waste_id (за датою не можна: є списання заднім числом).
		target = active.reduce(
			(best, w) =>
				best === null || Number(w.waste_id) > Number(best.waste_id) ? w : best,
			null,
		);
	}

	if (!target) {
		console.log(
			"\nНемає списання для деталізації. Збільште період або перевірте waste_id.",
		);
		process.exit(0);
	}

	console.log(`\nКороткий запис (waste_id=${target.waste_id}):\n`);
	console.log(JSON.stringify(target, null, 2));

	console.log(`\nДеталі (storage.getWaste, waste_id=${target.waste_id}):\n`);
	const details = await posterRequest(token, "storage.getWaste", {
		waste_id: target.waste_id,
	});
	console.log(JSON.stringify(details, null, 2));
} catch (error) {
	console.error(error.message);
	process.exit(1);
}
