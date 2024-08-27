export interface Category {
  id: string;
  name: string;
  path_from_root: Category[];
  children_categories?: Category[];
  attributes?: CategoryAttribute[];
}

export interface Categories {
  [key: string]: Category;
}

export interface CategoryPulpo {
  id: string;
  name: string;
  id_parent_category_mk: string | null;
  category_id_mk?: string;
  id_marketplace: number;
  children?: CategoryPulpo[];
  meli_attributes: CategoryAttribute[] | null;
}

export interface PulpoCategory {
  id: number;
  name: string;
}

export interface CategoryAttribute {
  // id?: number;
  id: string;
  name: string;
  hint?: string;
  description?: string;
  value_type: string;
  values?: AttributeValue[];
  id_marketplace: number;
}

export interface AttributeValue {
  id?: string;
  // value_id: string;
  name: string;
  id_marketplace: number;
}
