type IngredientData = {
  [ingredient: string]: number;
};

type ConvertingValues = {
  [productName: string]: IngredientData;
};

export const convertingValues: ConvertingValues = {
  'Кола': {
    'Сироп кола': 36.2,
  },
  'Фанта': {
    'Сироп фанта': 43.2,
  },
  'Спрайт': {
    'Сироп спрайт': 36.2,
  },
  'Апельсиновий сік': {
    'Концентрат соку': 42.5,
  },
  'Лате': {
    'Кава': 10,
    'Молоко': 173.1,
  },
  'Капучино': {
    'Кава': 11,
    'Молоко': 121.9,
  },
  'Флет Вайт': {
    'Кава': 18,
    'Молоко': 112.1,
  },
  'Американо': {
    'Кава': 15,
  },
  'Американо з молоком': {
    'Кава': 51.2,
    'Молоко': 15,
  },
  'Еспресо': {
    'Кава': 10,
  },
  'Подвійне еспресо': {
    'Кава': 13,
  },
  'Чай чорний': {
    'Чай чорний': 1,
  },
  'Чай зелений': {
    'Чай зелений': 1,
  },
  }