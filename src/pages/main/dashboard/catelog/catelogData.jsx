import ProductH from "../../../../images/product/h.png";
import ProductE from "../../../../images/product/e.png";
import ProductF from "../../../../images/product/f.png";
import ProductG from "../../../../images/product/g.png";

export const categoriesData = [
  {
    id: 1,
    image: ProductE,
    name: "Smart Devices",
    subcategory: "3 Items",
    productCount: "21 items",
    status: "Active",
  },
  {
    id: 2,
    image: ProductF,
    name: "Smartphones",
    subcategory: "2 Items",
    productCount: "10 items",
    status: "Active",
  },
  {
    id: 3,
    image: ProductH,
    name: "Funitures",
    subcategory: "5 Items",
    productCount: "7 items",
    status: "Inactive",
  },
  {
    id: 4,
    image: ProductG,
    name: "Clothings",
    subcategory: "1 Items",
    productCount: "10 items",
    status: "Active",
  },
];

export const categories = ["Smart Devices", "Clothings", "Funitures", "Smartphones"];
export const categoriesOptions = [
  {
    label: "Smart Devices",
    value: "Smart Devices",
  },
  {
    label: "Clothings",
    value: "Clothings",
  },
  {
    label: "Funitures",
    value: "Funitures",
  },
  {
    label: "Smartphones",
    value: "Smartphones",
  },
];

export const subCategoriesData = [
  {
    id: 0,
    name: "Oriamo Smartwatch",
    category: "Smart Devices",
    // subcategory: "3 Items",
    productCount: "21 items",
    sizeCount: "2 items",
    status: "Active",
  },
  {
    id: 1,
    name: "Iphone",
    category: "Smartphones",
    // subcategory: "2 Items",
    productCount: "10 items",
    sizeCount: "2 items",
    status: "Active",
  },
  {
    id: 2,
    name: "Cushions",
    category: "Funitures",
    // subcategory: "5 Items",
    productCount: "7 items",
    sizeCount: "2 items",
    status: "Active",
  },
  {
    id: 3,
    name: "Men's Clothings",
    category: "Clothings",
    // subcategory: "1 Items",
    productCount: "10 items",
    sizeCount: "2 items",
    status: "Active",
  },
];

export const brandData = [
  {
    id: 1,
    image: ProductG,
    name: "Apple",
    productCount: "5 Items",
    status: "Active",
  },
  {
    id: 2,
    image: ProductH,
    name: "Facebook",
    productCount: "20 Items",
    status: "Active",
  },
];

export const colors = [
  {
    id: 1,
    name: "Black",
    status: "Active",
  },
  {
    id: 2,
    name: "Midnight Green",
    status: "Active",
  },
];

export const productTypeData = {
  data: [
    {
      _id: 1,
      name: "Physical",
      productCount: "10 items",
      status: "Active",
    },
    {
      _id: 2,
      name: "Virtual",
      productCount: "4 items",
      status: "Active",
    },
    // {
    //   id: 3,
    //   name: "Affiliate",
    //   productCount: "7 items",
    //   status: "Active",
    // },
  ],
};

export const filterCatelogStatus = [
  {
    label: "active",
    value: "active",
  },
  {
    label: "inactive",
    value: "inactive",
  },
];
