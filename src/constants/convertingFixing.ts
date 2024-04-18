export const convertingFixing: { [itemName: string]: { [unit: string]: number } } = {
  Кава: { "кг.": 1000 }, // converting kg to grams
  Молоко: { "л.": 1000 }, // converting liters to milliliters
  "Концентрат соку": { "л.": 1000 }, // converting liters to milliliters
  "Сироп кола": { "л.": 1000 }, // converting liters to milliliters
  "Сироп спрайт": { "л.": 1000 }, // converting liters to milliliters
  "Сироп фанта": { "л.": 1000 }, // converting liters to milliliters
  "Чай зелений": { "шт.": 1 },
  "Чай чорний": { "шт.": 1 },
};