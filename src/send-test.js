// Надсилає тестове повідомлення, щоб перевірити токен і chat_id.
import { sendMessage } from "./telegram.js";

const token = process.env.TELEGRAM_BOT_TOKEN?.trim();
const chatId = process.env.TELEGRAM_CHAT_ID?.trim();

if (!token || !chatId) {
	console.error("Потрібні TELEGRAM_BOT_TOKEN і TELEGRAM_CHAT_ID у .env");
	process.exit(1);
}

const text = [
	"✅ Тестове повідомлення",
	"",
	"Бот для контролю списань у Poster підключено.",
].join("\n");

try {
	await sendMessage(token, chatId, text);
	console.log("Повідомлення надіслано. Перевірте Telegram.");
} catch (error) {
	console.error(error.message);
	process.exit(1);
}
