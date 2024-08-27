import { NextFunction, Request, Response } from 'express';
import {
  getCategories,
  getMeLiCategories,
  getMeliCategoryAttributes,
  getPulpoCategories,
} from '../database/gets/category.get';
import {
  saveAttribute,
  saveAttributeOptions,
  saveCategories,
  saveCategory,
  saveCategoryAttributes,
  saveOption,
  savePulpoCategories,
} from '../database/post/category.post';
import { deleteTableData } from '../database/db/connectDB';
import { homologateCategories } from '../utils/categories';
import { CategoryPulpo, PulpoCategory } from '../utils/interfaces/category';

export default class CategoryController {
  static synchronizeCategories = async (
    _req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    try {
      let startDate = Date.now();
      let meliCategories = await getMeLiCategories();
      await deleteTableData('category_mk_attribute_mk', 1);
      await deleteTableData('attribute_mk_option', 1);

      await deleteTableData('category_mk', 1);
      await deleteTableData('attribute_mk', 1);
      await deleteTableData('option', 1);

      for (const key in meliCategories) {
        let category = meliCategories[key];
        let parent =
          category.path_from_root.length > 1
            ? category.path_from_root[category.path_from_root.length - 2]
            : null;

        let categoryPulpo: CategoryPulpo = {
          // category_id_mk: category.id,
          id: category.id,
          name: category.name,
          id_parent_category_mk: parent ? parent.id : null,
          id_marketplace: 1,
          meli_attributes: category.attributes || null,
        };
        await saveCategory(categoryPulpo);

        if (category.attributes) {
          for (const attribute of category.attributes) {
            let attributeId = await saveAttribute(category.id, attribute);
            if (attribute.values) {
              for (const option of attribute.values) {
                await saveOption(attributeId, option);
              }
            }
          }
        }
      }
      let endDate = Date.now();

      // Guardado de categorías -> 4.97 segundos
      // Guardado de atributos + opciones -> 1.44 horas
      console.log(
        'Operation completed in',
        new Date(endDate - startDate).getHours(),
        'hours.',
      );

      // TODO: Revisar bien como deberían homologarse las categorías de cada marketplace (criterios y consideraciones)
      return res.status(200).json({
        success: true,
        message: 'Data synchronized successfully',
        error: null,
        stack: null,
      });
    } catch (error) {
      console.log(error);
      return res.status(200).json({
        success: false,
        data: null,
        error: 'Could not synchronize category data',
        stack: error,
      });
    }
  };
  // static synchronizeAttributes = async (
  //   _req: Request,
  //   res: Response,
  //   _next: NextFunction,
  // ) => {
  //   try {
  //     let deletedOldAttributes = false;
  //     let pulpoCategories = await getPulpoCategories(1);
  //     for (const category of pulpoCategories) {
  //       let attributes = await getMeliCategoryAttributes(
  //         category.category_id_mk!,
  //       );
  //       console.log(attributes);

  //       if (attributes.length > 0) {
  //         if (!deletedOldAttributes) {
  //           await deleteTableData('category_mk_attribute_mk', 1);
  //           await deleteTableData('attribute_mk_option', 1);
  //           await deleteTableData('option', 1);
  //           await deleteTableData('attribute_mk', 1);
  //           deletedOldAttributes = true;
  //         }

  //         // await saveCategoryAttributes(category.id, attributes);
  //         await saveAttributeOptions(attributes);
  //       }
  //     }
  //     return res.json({
  //       success: true,
  //       message: 'Attribute data synchronized successfully',
  //       error: null,
  //       stack: null,
  //     });
  //   } catch (error) {
  //     console.error(error);
  //     return res.json({
  //       success: false,
  //       data: null,
  //       error: 'Could not synchronize attribute data',
  //       stack: error,
  //     });
  //   }
  // };
}
