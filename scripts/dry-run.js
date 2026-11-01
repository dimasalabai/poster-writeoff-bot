// Імітація роботи бота. Стан в пам'яті: «останні N списань вважаємо новими».
// Запуск: npm run dry-run -- 0          нічого нового (усе вже оброблено)
//         npm run dry-run -- 2          останні 2 списання кожного акаунта як нові
//         npm run dry-run -- 1 send     те саме, але ще й надіслати в Telegram
import { loadConfig } from "../src/config.js";
import { sendMessage } from "../src/clients/telegram.js";
import { fetchRecentWastes, pickNew, buildMessages } from "../src/poll.js";

const count = Number(process.argv[2] ?? 2);
const shouldSend = process.argv[3] === "send";

try {
	const config = loadConfig();

	for (const account of config.accounts) {
		const wastes = await fetchRecentWastes(account.token);
		console.log(
			`\n=== ${account.name}: за 7 днів знайдено ${wastes.length} списань ===`,
		);

		// Усе, крім останніх N, вважаємо вже обробленим.
		const processed = wastes.slice(0, Math.max(0, wastes.length - count));
		const seen = new Set(processed.map((w) => String(w.waste_id)));

		const fresh = pickNew(wastes, seen);
		console.log(`Нові: ${fresh.map((w) => w.waste_id).join(", ") || "немає"}`);

		const messages = await buildMessages(account, fresh);
		for (const message of messages) {
			console.log(`\n--- waste_id=${message.id} ---\n${message.text}`);
			if (shouldSend) {
				await sendMessage(
					config.telegram.botToken,
					config.telegram.chatId,
					message.text,
				);
				console.log("(надіслано в Telegram)");
			}
		}
	}
} catch (error) {
	console.error(error.message);
	process.exit(1);
}
