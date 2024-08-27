import { ITask } from 'pg-promise';
import {
  CategoryAttribute,
  CategoryPulpo,
  PulpoCategory,
  type AttributeValue,
} from '../../utils/interfaces/category';
import pg, { pgPromise } from '../db/db.promise';
import {
  getMaxIdTable,
  getRepeatedAttribute,
  getRepeatedAttributeOptions,
  getRepeatedCategoryAttribute,
  getRepeatedOptions,
} from '../gets/category.get';
import pool from '../db/db';

const { ColumnSet, insert } = pgPromise.helpers;

export const savePulpoCategories = async (categories: PulpoCategory[]) => {
  try {
    const columns = new ColumnSet(['id', 'name'], { table: 'category_pulpo' });
    const query = insert(categories, columns);
    await pg.none(query);
  } catch (error) {
    console.error(error);
    throw error;
  }
};

export const saveCategories = async (
  categoryValues: CategoryPulpo[],
  db?: ITask<{}>,
) => {
  try {
    /**
     * id: number;
       name: string;
       id_parent_category_mk?: number;
       category_id_mk: string;
       id_marketplace: number;
       meli_attributes: Category[]
     */
    const categoryCs = new ColumnSet(
      [
        'id',
        'name',
        'id_parent_category_mk',
        // 'category_id_mk',
        'id_marketplace',
        'meli_attributes',
      ],
      { table: 'category_mk' },
    );

    const categoryQuery = insert(categoryValues, categoryCs);
    db ? await db?.none(categoryQuery) : await pg.none(categoryQuery);
  } catch (error) {
    throw error;
  }
};

export const saveCategory = async (categoryPulpo: CategoryPulpo) => {
  let client = await pool.connect();
  try {
    let result = await client.query(
      `INSERT INTO category_mk (id, name, id_parent_category_mk, id_marketplace)
      VALUES ($1, $2, $3, $4)`,
      [
        categoryPulpo.id,
        categoryPulpo.name,
        categoryPulpo.id_parent_category_mk,
        1,
      ],
    );
    console.log(`Category ${categoryPulpo.name} saved successfully`);
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
};

export const saveAttribute = async (
  idCategory: string,
  attribute: CategoryAttribute,
) => {
  let client = await pool.connect();
  try {
    let result = await client.query(
      `INSERT INTO attribute_mk (attribute_id, name, description, value_type, id_marketplace)
      VALUES ($1, $2, $3, $4, $5) RETURNING id`,
      [
        attribute.id,
        attribute.name,
        attribute.description || attribute.hint || null,
        attribute.value_type,
        1,
      ],
    );
    await client.query(
      `INSERT INTO category_mk_attribute_mk (id_category_mk, id_attribute_mk, id_marketplace)
      VALUES ($1, $2, $3)`,
      [idCategory, result.rows[0].id, 1],
    );
    console.log(`Attribute ${attribute.name} saved successfully`);
    return Number(result.rows[0].id);
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
};
export const saveOption = async (
  idAttribute: number,
  option: AttributeValue,
) => {
  let client = await pool.connect();
  try {
    let result = await client.query(
      `INSERT INTO option (value_id, value_name, id_marketplace)
      VALUES ($1, $2, $3) RETURNING id`,
      [option.id, option.name, 1],
    );
    await client.query(
      `INSERT INTO attribute_mk_option (id_attribute_mk, id_option, id_marketplace)
      VALUES ($1, $2, $3)`,
      [idAttribute, result.rows[0].id, 1],
    );
    console.log(`Option ${option.name} saved successfully`);
  } catch (error) {
    console.error(error);
    throw error;
  } finally {
    client.release();
  }
};

const saveAttributes = async (
  idCategory: string,
  categoryAttributes: CategoryAttribute[],
) => {
  try {
    /*
    id: number;
    attribute_id: string;
    name: string;
    description: string;
    value_type: string;
    */

    let attrValues: any[] = [];
    let attrCatValues: any[] = [];
    let attrId = await getMaxIdTable('attribute_mk');
    if (!attrId) {
      attrId = 0;
    }
    for (const attribute of categoryAttributes) {
      // let repeatedAttribute = await getRepeatedAttribute(
      //   attribute.attribute_id,
      // );
      // if (!repeatedAttribute) {
      attrId++;
      attrValues.push({
        id: attrId,
        attribute_id: attribute.attribute_id,
        name: attribute.name,
        description: attribute.description,
        value_type: attribute.value_type,
        id_marketplace: 1,
      });
      // }
      // let repeatedAttrCategory = await getRepeatedCategoryAttribute(
      //   idCategory,
      //   attribute.attribute_id,
      // );
      // if (!repeatedAttrCategory) {
      attrCatValues.push({
        id_category_mk: idCategory,
        id_attribute_mk: attrId,
        id_marketplace: 1,
      });
      // }
    }

    return { attrValues, attrCatValues };
  } catch (error) {
    throw error;
  }
};

async function saveOptions(attribute: CategoryAttribute) {
  let optionValues: any[] = [];
  let attrOptionValues: any[] = [];

  if (attribute.values && attribute.values.length > 0) {
    let optId = await getMaxIdTable('option');
    if (!optId) {
      optId = 0;
    }
    let pulpoAttr = await getRepeatedAttribute(attribute.attribute_id);
    for (let value of attribute.values) {
      // let repeatedOptions = await getRepeatedOptions(value);
      // if (!repeatedOptions) {
      optionValues.push({
        id: ++optId,
        value_id: value.id,
        value_name: value.name,
        id_marketplace: 1,
      });
      // }
      // let repeatedAttrOptions = await getRepeatedAttributeOptions(
      //   attribute.id!,
      //   value.value_id.toString(),
      // );
      // if (!repeatedAttrOptions) {
      attrOptionValues.push({
        id_attribute_mk: pulpoAttr.id,
        id_option: optId,
        id_marketplace: 1,
      });
      // }
    }
  }
  return { optionValues, attrOptionValues };
}

export const saveCategoryAttributes = async (
  categoryId: string,
  attributes: CategoryAttribute[],
  db?: ITask<{}>,
) => {
  try {
    const attributeCs = new ColumnSet(
      [
        'id',
        'attribute_id',
        'name',
        'description',
        'value_type',
        'id_marketplace',
      ],
      { table: 'attribute_mk' },
    );
    const attributeCategoryCs = new ColumnSet(
      ['id_category_mk', 'id_attribute_mk', 'id_marketplace'],
      { table: 'category_mk_attribute_mk' },
    );

    let data = await saveAttributes(categoryId, attributes);
    console.log(data);

    if (data.attrValues.length > 0) {
      let oQuery = insert(data.attrValues, attributeCs);
      db ? await db.none(oQuery) : await pg.none(oQuery);
    }
    if (data.attrCatValues.length > 0) {
      let aoQuery = insert(data.attrCatValues, attributeCategoryCs);
      db ? await db.none(aoQuery) : await pg.none(aoQuery);
    }
  } catch (error) {
    throw error;
  }
};

export const saveAttributeOptions = async (
  attributes: CategoryAttribute[],
  db?: ITask<{}>,
) => {
  try {
    const attributeOptionCs = new ColumnSet(
      ['id', 'value_id', 'value_name', 'id_marketplace'],
      {
        table: 'option',
      },
    );
    const attrOptionCs = new ColumnSet(
      ['id_attribute_mk', 'id_option', 'id_marketplace'],
      {
        table: 'attribute_mk_option',
      },
    );

    for (const attribute of attributes) {
      let data = await saveOptions(attribute);
      console.log(data);

      if (data.optionValues.length > 0) {
        let oQuery = insert(data.optionValues, attributeOptionCs);
        db ? await db.none(oQuery) : await pg.none(oQuery);
      }
      if (data.attrOptionValues.length > 0) {
        let aoQuery = insert(data.attrOptionValues, attrOptionCs);
        db ? await db.none(aoQuery) : await pg.none(aoQuery);
      }
    }
  } catch (error) {
    throw error;
  }
};
