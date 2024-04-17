import axios from 'axios';

export const fetchCategoriesData = async (categories: string[], selectionRange: string, sheetId: string, apiKey: string) => {
  try {
    const storedMenuItems = localStorage.getItem('menuItems');

    if (storedMenuItems) {
      return JSON.parse(storedMenuItems);
    }

    const promises = categories.map(category => (
      axios.get(`https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${category}${selectionRange}?key=${apiKey}`)
        .then(response => response.data.values)
        .catch(error => {
          console.error(`Error fetching data for category ${category}:`, error);
          return null;
        })
    ));

    const responses = await Promise.all(promises);
    const menuItems = responses.filter(Boolean);
    localStorage.setItem('menuItems', JSON.stringify(menuItems));
    return menuItems;
  } catch (error) {
    console.error('Error fetching categories data:', error);
    throw error;
  }
};
