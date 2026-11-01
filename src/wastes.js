// Завантаження довідників Poster і перетворення списання на зручний вигляд.
import { posterRequest } from "./clients/poster.js";

const UNITS = { kg: "кг", l: "л", p: "шт" };

function unitLabel(unit) {
	return UNITS[unit] ?? unit ?? "шт";
}

function asArray(value, method) {
	if (!Array.isArray(value)) {
		throw new Error(`${method}: очікувався масив`);
	}
	return value;
}

function toMap(list, idField, nameField) {
	const map = new Map();
	for (const item of list) {
		const name = String(item[nameField] ?? "")
			.replace(/\s+/g, " ")
			.trim();
		if (name) map.set(String(item[idField]), name);
	}
	return map;
}

// Довідники: ID -> назва. Запити по черзі, бо ліміти частоти нам невідомі.
export async function loadDictionaries(token) {
	const products = asArray(
		await posterRequest(token, "menu.getProducts"),
		"menu.getProducts",
	);
	const ingredients = asArray(
		await posterRequest(token, "menu.getIngredients"),
		"menu.getIngredients",
	);
	const employees = asArray(
		await posterRequest(token, "access.getEmployees"),
		"access.getEmployees",
	);

	return {
		products: toMap(products, "product_id", "product_name"),
		ingredients: toMap(ingredients, "ingredient_id", "ingredient_name"),
		employees: toMap(employees, "user_id", "name"),
	};
}

// Одна позиція списання -> один або кілька рядків {name, quantity, unit}.
function describeElement(element, dict) {
	const type = Number(element.type);
	const lines = element.ingredients ?? [];
	const productName = dict.products.get(String(element.product_id));

	// Списано безпосередньо інгредієнт.
	if (type === 10 && lines.length > 0) {
		return lines.map((line) => ({
			name:
				dict.ingredients.get(String(line.ingredient_id)) ??
				`інгредієнт №${line.ingredient_id}`,
			quantity: Number(line.weight),
			unit: unitLabel(line.unit),
		}));
	}

	// Товар з одним складським рядком: кількість і одиниця беруться з нього.
	if (type === 1 && lines.length === 1) {
		return [
			{
				name: productName ?? `товар №${element.product_id}`,
				quantity: Number(lines[0].weight),
				unit: unitLabel(lines[0].unit),
			},
		];
	}

	// Тех. картка та інші типи: кількість порцій з поля count.
	return [
		{
			name: productName ?? `позиція №${element.product_id} (тип ${type})`,
			quantity: Number(element.count),
			unit: "шт",
		},
	];
}

export function normalizeWaste(waste, dict) {
	return {
		id: String(waste.waste_id),
		date: waste.date,
		employee:
			dict.employees.get(String(waste.user_id)) ??
			`користувач №${waste.user_id}`,
		reason: String(waste.reason_name ?? "").trim() || null,
		totalUah: Number(waste.total_sum) / 100, // у відповіді суми в копійках
		items: (waste.elements ?? []).flatMap((element) =>
			describeElement(element, dict),
		),
	};
}
