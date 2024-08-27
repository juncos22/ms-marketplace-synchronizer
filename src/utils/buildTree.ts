import axios from 'axios';
import { Category } from './interfaces/category';

// let countRows = 0;
export function buildCategoryTree(category: Category): Category {
  // countRows++;
  if (
    !category.children_categories ||
    category.children_categories.length === 0
  ) {
    return category;
  }
  // Recursivamente construir el árbol de categorías
  category.children_categories = category.children_categories.map((child) => {
    // const updatedChild = await fetchCategoryDetails(child.id);
    category.meli_attributes = child.meli_attributes;
    return buildCategoryTree(child);
  });
  return category;
}

async function fetchCategoryDetails(categoryId: string): Promise<Category> {
  const response = await axios.get(
    `https://api.mercadolibre.com/categories/${categoryId}`,
  );
  const responseData = response.data;

  // Mapear manualmente los atributos necesarios
  const category = {
    id: responseData.id,
    name: responseData.name,
    // path_from_root: responseData.path_from_root,
    children_categories: responseData.children_categories,
  };

  return category;
}
