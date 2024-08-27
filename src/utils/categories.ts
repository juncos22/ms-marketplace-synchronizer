import axios from 'axios';
import {
  Categories,
  Category,
  CategoryAttribute,
  CategoryPulpo,
  PulpoCategory,
} from './interfaces/category';

async function getPrimaryCategories() {
  const response = await axios.get(
    'https://api.mercadolibre.com/sites/MLC/categories',
  );
  return response.data;
}
export const simplifyResponse = async (data: Categories) => {
  const result: Category[] = [];
  // const primarysCategories = new Set<string>();
  // let categories = await getPrimaryCategories();

  // categories.forEach((category: any) => {
  //   primarysCategories.add(category.id);
  // });
  // console.log(primarysCategories);
  let attrId = 0;
  for (const key in data) {
    // if (primarysCategories.has(key)) {
    const item = data[key];
    // console.log('Category with attributes:', item);

    result.push({
      id: item.id,
      name: item.name,
      children_categories: item.children_categories,
      meli_attributes: item.attributes
        ? item.attributes.map((a: any) => ({
            id: ++attrId,
            attribute_id: a.id,
            name: a.name,
            description: a.description || a.hint,
            value_type: a.value_type,
            values: a.values || [],
            id_marketplace: 1,
          }))
        : [],
    });
    // }
  }

  return result;
};

export const simplifyAttributes = (
  data: any[],
  relevance?: string,
  required?: string,
) => {
  // Si se especifica `relevance`, se filtran los atributos por relevancia
  let filteredData = relevance
    ? data.filter((attr) => attr.relevance === Number(relevance))
    : data;

  // Si se especifica el parámetro "required"
  if (required === 'true') {
    filteredData = filteredData.filter((attr) => {
      const hasTags = attr.tags && typeof attr.tags === 'object';
      const isRequired = hasTags ? attr.tags.required === true : false;
      return isRequired;
    });
  }

  return filteredData.map(
    ({ id, name, hint, value_type, values, allowed_units }) => ({
      attribute_id: id,
      name,
      description: hint,
      value_type,
      values: values
        ? values.map((v: any) => ({ value_id: v.id, value_name: v.name }))
        : allowed_units
        ? allowed_units.map((au: any) => ({
            value_id: au.id,
            value_name: au.name,
          }))
        : [],
    }),
  );
};

export const homologateCategories = (categories: CategoryPulpo[]) => {
  return categories
    .filter((c) => !c.id_parent_category_mk)
    .map((c: PulpoCategory) => ({ id: c.id, name: c.name } as PulpoCategory));
};
