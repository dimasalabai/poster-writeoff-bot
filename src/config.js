// Читає налаштування зі змінних середовища та перевіряє, що всі задані.

const REQUIRED = [
	"TELEGRAM_BOT_TOKEN",
	"TELEGRAM_CHAT_ID",
	"POSTER_1_NAME",
	"POSTER_1_TOKEN",
	"POSTER_2_NAME",
	"POSTER_2_TOKEN",
];

export function findMissing(env = process.env) {
	return REQUIRED.filter((key) => !env[key] || env[key].trim() === "");
}

export function loadConfig(env = process.env) {
	const missing = findMissing(env);
	if (missing.length > 0) {
		throw new Error(`Не задані налаштування: ${missing.join(", ")}`);
	}

	return {
		telegram: {
			botToken: env.TELEGRAM_BOT_TOKEN.trim(),
			chatId: env.TELEGRAM_CHAT_ID.trim(),
		},
		accounts: [
			{
				id: "poster1",
				name: env.POSTER_1_NAME.trim(),
				token: env.POSTER_1_TOKEN.trim(),
			},
			{
				id: "poster2",
				name: env.POSTER_2_NAME.trim(),
				token: env.POSTER_2_TOKEN.trim(),
			},
		],
	};
}

export { REQUIRED };
