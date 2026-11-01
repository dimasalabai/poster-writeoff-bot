// Перевірка довідників: перетворює ID зі списання на назви.
// Запуск: npm run poster:names -- 1 4480   (акаунт 1, списання waste_id=4480)
import { posterRequest } from "../src/clients/poster.js";

const accountNumber = process.argv[2] ?? "1";
const wasteId = process.argv[3];

const token = process.env[`POSTER_${accountNumber}_TOKEN`]?.trim();

if (!token) {
	console.error(`POSTER_${accountNumber}_TOKEN не задано в .env`);
	process.exit(1);
}
if (!wasteId) {
	console.error(
		"Вкажіть waste_id третім словом: npm run poster:names -- 1 4480",
	);
	process.exit(1);
}

function findBy(list, field, id) {
	return list.find((item) => String(item[field]) === String(id));
}

function ensureArray(value, method) {
	if (!Array.isArray(value)) {
		throw new Error(`${method}: очікувався масив, а прийшло інше`);
	}
	return value;
}

try {
	const waste = await posterRequest(token, "storage.getWaste", {
		waste_id: wasteId,
	});

	// Запити робимо по черзі, бо ліміти частоти запитів нам ще невідомі.
	const products = ensureArray(
		await posterRequest(token, "menu.getProducts"),
		"menu.getProducts",
	);
	const ingredients = ensureArray(
		await posterRequest(token, "menu.getIngredients"),
		"menu.getIngredients",
	);
	const employees = ensureArray(
		await posterRequest(token, "access.getEmployees"),
		"access.getEmployees",
	);

	console.log(`menu.getProducts: ${products.length} шт.`);
	console.log("  поля:", Object.keys(products[0] ?? {}).join(", "));
	console.log(`menu.getIngredients: ${ingredients.length} шт.`);
	console.log("  поля:", Object.keys(ingredients[0] ?? {}).join(", "));
	console.log(`access.getEmployees: ${employees.length} шт.`);
	console.log("  поля:", Object.keys(employees[0] ?? {}).join(", "));

	console.log(
		`\nСписання ${waste.waste_id}, дата ${waste.date}, причина: ${waste.reason_name}`,
	);

	const employee = findBy(employees, "user_id", waste.user_id);
	console.log(
		`Працівник: user_id=${waste.user_id} -> ${employee ? employee.name : "НЕ ЗНАЙДЕНО"}`,
	);

	for (const element of waste.elements ?? []) {
		const product = findBy(products, "product_id", element.product_id);
		console.log(
			`\nПозиція: type=${element.type} product_id=${element.product_id} count=${element.count} ` +
				`-> ${product ? (product.product_name ?? "(поле product_name відсутнє)") : "НЕ ЗНАЙДЕНО в menu.getProducts"}`,
		);

		for (const line of element.ingredients ?? []) {
			const ingredient = findBy(
				ingredients,
				"ingredient_id",
				line.ingredient_id,
			);
			console.log(
				`  інгредієнт ${line.ingredient_id}: ${line.weight} ${line.unit} ` +
					`-> ${ingredient ? ingredient.ingredient_name : "НЕ ЗНАЙДЕНО в menu.getIngredients"}`,
			);
		}
	}
} catch (error) {
	console.error(error.message);
	process.exit(1);
}
