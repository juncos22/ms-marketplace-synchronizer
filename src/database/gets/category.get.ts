import { buildCategoryTree } from '../../utils/buildTree';
import axios, { all } from 'axios';
import { simplifyAttributes, simplifyResponse } from '../../utils/categories';
import pg, { pgPromise } from '../db/db.promise';
import { ITask } from 'pg-promise';
import pool from '../db/db';
import {
  AttributeValue,
  Categories,
  Category,
  CategoryAttribute,
  CategoryPulpo,
} from '../../utils/interfaces/category';
import { saveCategories, saveCategoryAttributes } from '../post/category.post';

// const { ColumnSet, insert } = pgPromise.helpers;

export const getPulpoCategories = async (id_markerplace: number) => {
  try {
    return pg.map<CategoryPulpo>(
      `SELECT id, name, id_marketplace, category_id_mk, id_parent_category_mk 
      FROM category_mk WHERE id_marketplace = $1`,
      [id_markerplace],
      (c) => ({
        id: c.id,
        name: c.name,
        id_marketplace: c.id_markerplace,
        category_id_mk: c.category_id_mk,
        id_parent_category_mk: c.id_parent_category_mk,
      }),
    );
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getPulpoCategoryByCategoryIdMK = async (categoryId: string) => {
  try {
    const result = await pool.query<CategoryPulpo>(
      'SELECT * FROM category_mk WHERE category_id_mk = $1',
      [categoryId],
    );
    return result.rows[0];
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getMeLiCategories = async () => {
  try {
    // TODO: Agregar el parametro 'withAttributes' en true para incluir los atributos de cada categoria
    const response = await axios.get<Categories>(
      'https://api.mercadolibre.com/sites/MLA/categories/all?withAttributes=true',
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCategories = async (categoryTree: Category[]) => {
  let categoryArr: CategoryPulpo[] = [];
  let categoryId = await getMaxIdTable('category_mk');
  if (!categoryId) {
    categoryId = 1;
  }

  const insertCategory = (category: Category, parentId?: number) => {
    let idCurrent = categoryId;
    categoryId++;

    categoryArr.push({
      id: idCurrent,
      name: category.name,
      id_parent_category_mk: parentId || null,
      category_id_mk: category.id,
      meli_attributes: category.meli_attributes || [],
      id_marketplace: 1,
    });

    if (
      category.children_categories &&
      category.children_categories.length > 0
    ) {
      category.children_categories.forEach(async (child) => {
        insertCategory(child, idCurrent);
      });
    }
  };

  try {
    categoryTree.forEach((category) => insertCategory(category));
    return categoryArr;
  } catch (error) {
    throw error;
  }
};

export const getMeliCategoryAttributes = async (categoryId: string) => {
  try {
    const res = await axios.get(
      `https://api.mercadolibre.com/categories/${categoryId}/attributes`,
    );

    let simplifiedAttributes = simplifyAttributes(
      res.data,
    ) as CategoryAttribute[];

    let attrId = await getMaxIdTable('attribute_mk');
    let optionId = await getMaxIdTable('option');

    return Promise.all(
      simplifiedAttributes.map(async (attribute) => ({
        ...attribute,
        id: ++attrId,
        values: attribute.values?.map((value) => ({
          ...value,
          id: ++optionId,
        })),
      })),
    );
    // return simplifiedAttributes;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getMaxIdTable = async (tableName: string) => {
  let client = await pool.connect();
  let result = await client.query(`SELECT MAX(id) as maxId FROM ${tableName};`);
  let maxId = result.rows[0].maxid;
  client.release();
  // console.log(`${tableName} maxId: ${Number(maxId)}`);
  return Number(maxId);
};

export const getPulpoAttributeOptions = async (idAttribute: number) => {
  try {
    const result = await pool.query<AttributeValue>(
      `SELECT o.id, o.value_id, o.value_name FROM option o
      INNER JOIN attribute_mk_option ao ON ao.id_option = o.id
      INNER JOIN attribute_mk a ON ao.id_attribute_mk = a.id
      WHERE a.id = $1`,
      [idAttribute],
    );
    return result.rows;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const getPulpoChildrenCategories = async (idParentCategory: number) => {
  try {
    const result = await pool.query<CategoryPulpo>(
      `SELECT * FROM category_mk WHERE id_parent_category_mk = $1`,
      [idParentCategory],
    );
    return result.rows;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

export async function getRepeatedAttribute(attrIdMk: string) {
  let client = await pool.connect();
  let result = await client.query<CategoryAttribute>(
    `SELECT * FROM attribute_mk a WHERE a.attribute_id = $1`,
    [attrIdMk],
  );
  client.release();
  return result.rows[0];
}

export async function getRepeatedCategoryAttribute(
  categoryId: string,
  attributeId: string,
) {
  try {
    let client = await pool.connect();
    let result = await client.query(
      `
      SELECT c.name, a.id, a.attribute_id, a.name, a.description, a.value_type
      FROM attribute_mk a 
      INNER JOIN category_mk_attribute_mk ON a.id = category_mk_attribute_mk.id_attribute_mk 
      INNER JOIN category_mk c ON c.id = category_mk_attribute_mk.id_category_mk
      WHERE a.id = $1 AND c.id = $2;`,
      [attributeId, categoryId],
    );
    client.release();
    return result.rows[0];
  } catch (error) {
    throw error;
  }
}

export const getRepeatedOptions = async (option: AttributeValue) => {
  try {
    let client = await pool.connect();
    let result = await client.query<AttributeValue>(
      `SELECT o.id, o.value_id, o.value_name 
      FROM option o 
      WHERE o.value_id = $1`,
      [option.value_id.toString()],
    );
    client.release();
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

export const getRepeatedAttributeOptions = async (
  idAttribute: number,
  optionId: string,
) => {
  try {
    let client = await pool.connect();
    let result = await client.query(
      `SELECT o.id, o.value_id, o.value_name FROM option o
      INNER JOIN attribute_mk_option ao ON ao.id_option = o.id
      INNER JOIN attribute_mk a ON ao.id_attribute_mk = a.id
      WHERE a.id = $1 AND o.value_id = $2;`,
      [idAttribute, optionId],
    );
    client.release();
    return result.rows[0];
  } catch (error) {
    throw error;
  }
};

export const getPulpoCategoryAttributes = async (categoryIdMk: string) => {
  try {
    let categoryAttributes = await pg.map(
      `SELECT a.id, a.attribute_id, a.name, a.description, a.value_type  
       FROM attribute_mk a 
       INNER JOIN category_mk_attribute_mk ON a.id = category_mk_attribute_mk.id_attribute_mk 
       INNER JOIN category_mk c ON c.id = category_mk_attribute_mk.id_category_mk
       WHERE c.category_id_mk = $1`,
      [categoryIdMk],
      (a) => a as CategoryAttribute,
    );
    categoryAttributes = await Promise.all(
      categoryAttributes.map(async (a) => ({
        ...a,
        values: await getPulpoAttributeOptions(a.id),
      })),
    );
    return categoryAttributes;
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const startDbTransaction = () => {
  async function getCategoryData(category: CategoryPulpo, t: ITask<{}>) {
    let tempCategory = category;
    let categoryAttributes = await getPulpoCategoryAttributes(
      tempCategory.category_id_mk,
    );

    if (categoryAttributes.length === 0) {
      categoryAttributes = await getMeliCategoryAttributes(
        tempCategory.category_id_mk,
      );

      let pulpoCategory = await getPulpoCategoryByCategoryIdMK(
        tempCategory.category_id_mk,
      );

      saveCategoryAttributes(pulpoCategory.id, categoryAttributes, t);

      categoryAttributes = await getPulpoCategoryAttributes(
        tempCategory.category_id_mk,
      );
    }

    tempCategory = { ...tempCategory, attributes: categoryAttributes };

    let children = await getPulpoChildrenCategories(category.id);

    if (children && children.length > 0) {
      let childrenPromises: Promise<CategoryPulpo>[] = [];
      children.map((child) =>
        childrenPromises.push(
          new Promise<CategoryPulpo>((resolve) =>
            resolve(getCategoryData(child, t)),
          ),
        ),
      );
      tempCategory.children = await Promise.all(childrenPromises);
    }
    return tempCategory;
  }

  try {
    return pg.task(async (t) => {
      let pulpoCategories = await getPulpoCategories(1);
      if (pulpoCategories.length === 0) {
        let meliCategories = await getMeLiCategories();
        pulpoCategories = await getCategories(meliCategories);
        await saveCategories(pulpoCategories);
        console.log('Categories saved');
      }

      let allData: CategoryPulpo[] = [];
      for (const category of pulpoCategories.slice(0, 5)) {
        let categoryData = await getCategoryData(category, t);
        allData.push(categoryData);
      }
      return { allData };
    });
  } catch (error) {
    console.error(error);
    throw error;
  }
};
