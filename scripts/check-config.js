// Показує, які налаштування задані. Самі значення НЕ виводить.
import { REQUIRED, findMissing } from "../src/config.js";

const missing = findMissing();

for (const key of REQUIRED) {
	const status = missing.includes(key) ? "НЕ ЗАДАНО" : "задано";
	console.log(`${key.padEnd(20)} ${status}`);
}

if (missing.length > 0) {
	console.log(`\nПроблема: не задано ${missing.length} з ${REQUIRED.length}.`);
	process.exit(1);
}

console.log("\nУсе гаразд: усі налаштування задані.");
