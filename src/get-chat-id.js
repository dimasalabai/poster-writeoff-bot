import { telegramRequest } from "./telegram.js";

const token = process.env.TELEGRAM_BOT_TOKEN?.trim();

if (!token) {
	console.error("TELEGRAM_BOT_TOKEN не задано в .env");
	process.exit(1);
}

try {
	const updates = await telegramRequest(token, "getUpdates");

	const chats = new Map();
	for (const update of updates) {
		const chat = update.message?.chat;
		if (chat) chats.set(chat.id, chat);
	}

	if (chats.size === 0) {
		console.log(
			"Повідомлень не знайдено. Надішліть боту повідомлення в Telegram і повторіть.",
		);
		process.exit(1);
	}

	for (const chat of chats.values()) {
		const who = chat.first_name ?? chat.title ?? chat.username ?? "(без імені)";
		console.log(`chat_id: ${chat.id}  тип: ${chat.type}  ім'я: ${who}`);
	}
} catch (error) {
	console.error(error.message);
	process.exit(1);
}
