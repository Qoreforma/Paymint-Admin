// import React, { useState, useEffect, useCallback } from "react";
// import Head from "../../../../layout/head/Head";
// import Content from "../../../../layout/content/Content";
// import {
//   Block,
//   BlockHead,
//   BlockTitle,
//   BlockBetween,
//   BlockHeadContent,
//   BlockDes,
//   Icon,
//   Row,
//   Col,
//   Button,
//   DataTableHead,
//   DataTableRow,
//   DataTableItem,
//   PaginationComponent,
//   TooltipComponent,
//   RSelect,
//   PreviewAltCard,
//   DataTable,
//   DataTableBody,
// } from "../../../../components/Component";
// import { DropdownItem, UncontrolledDropdown, DropdownMenu, DropdownToggle, Badge } from "reactstrap";
// import { productData, categoryOptions, productTypeOptions, statusOptions } from "../product/ProductData";
// import SimpleBar from "simplebar-react";
// import { useForm } from "react-hook-form";
// import ProductH from "../../../../images/product/h.png";
// import Dropzone from "react-dropzone";
// import { Modal, ModalBody } from "reactstrap";
// import { useNavigate } from "react-router-dom";
// import { filterProductType, filterProductStatus } from "../order/OrderData";

// const StoreListPage = () => {
//   const navigate = useNavigate();
//   const [data, setData] = useState(productData);
//   const [sm, updateSm] = useState(false);
//   const [filters, setfilters] = useState({});

//   const [formData, setFormData] = useState({
//     name: "",
//     img: null,
//     seller: "",
//     price: 0,
//     // salePrice: 0,
//     // stock: 0,
//     category: "",
//     subcategory: "",
//     brand: "",
//     productType: "",
//     status: "",
//     // fav: false,
//     check: false,
//   });
//   const [editId, setEditedId] = useState();
//   const [view, setView] = useState({
//     edit: false,
//     add: false,
//     details: false,
//   });
//   const [onSearchText, setSearchText] = useState("");
//   const [onSearch, setonSearch] = useState(false);

//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemPerPage, setItemPerPage] = useState(7);
//   const [files, setFiles] = useState([]);
//   const [sort, setSortState] = useState("");

//   // Changing state value when searching name
//   useEffect(() => {
//     if (onSearchText !== "") {
//       const filteredObject = productData.filter((item) => {
//         return item.name.toLowerCase().includes(onSearchText.toLowerCase());
//       });
//       setData([...filteredObject]);
//     } else {
//       setData([...productData]);
//     }
//   }, [onSearchText]);

//   // function to close the form modal
//   const onFormCancel = () => {
//     setView({ edit: false, add: false, details: false });
//     resetForm();
//   };

//   const resetForm = () => {
//     setFormData({
//       name: "",
//       img: null,
//       seller: "",
//       price: 0,
//       productType: null,
//       category: null,
//       subcategory: "",
//       brand: "",
//       status: null,
//       check: false,
//     });
//     reset({});
//   };

//   const onFormSubmit = (form) => {
//     const { title, price, salePrice, sku, stock } = form;
//     let submittedData = {
//       id: data.length + 1,
//       name: title,
//       img: files.length > 0 ? files[0].preview : ProductH,
//       sku: sku,
//       price: price,
//       salePrice: salePrice,
//       stock: stock,
//       category: formData.category,
//       fav: false,
//       check: false,
//     };
//     setData([submittedData, ...data]);
//     setView({ open: false });
//     setFiles([]);
//     resetForm();
//   };

//   const onEditSubmit = () => {
//     let submittedData;
//     let newItems = data;
//     let index = newItems.findIndex((item) => item.id === editId);
//     newItems.forEach((item) => {
//       if (item.id === editId) {
//         submittedData = {
//           id: editId,
//           name: formData.name,
//           img: files.length > 0 ? files[0].preview : item.img,
//           seller: formData.seller,
//           price: formData.price,
//           productType: formData.productType.value,
//           category: formData.category.value,
//           subcategory: formData.subcategory,
//           brand: formData.brand,
//           status: formData.status.value,
//           check: false,
//         };
//       }
//     });
//     newItems[index] = submittedData;
//     setData(newItems);
//     resetForm();
//     setView({ edit: false, add: false });
//   };

//   // function that loads the want to editted data
//   const onEditClick = (id) => {
//     data.forEach((item) => {
//       if (item.id === id) {
//         const categoryValue = { label: item.category, value: item.category };
//         const productTypeValue = { label: item.productType, value: item.productType };
//         const statusValue = { label: item.status, value: item.status };
//         // console.log(statusValue);
//         setFormData({
//           name: item.name,
//           img: item.img,
//           seller: item.seller,
//           price: item.price,
//           productType: productTypeValue,
//           category: categoryValue,
//           subcategory: item.subcategory,
//           brand: item.brand,
//           status: statusValue,
//           check: false,
//         });
//       }
//     });
//     setEditedId(id);
//     setFiles([]);
//     setView({ add: false, edit: true });
//   };

//   useEffect(() => {
//     reset(formData);
//   }, [formData]);

//   // selects all the products
//   const selectorCheck = (e) => {
//     let newData;
//     newData = data.map((item) => {
//       item.check = e.currentTarget.checked;
//       return item;
//     });
//     setData([...newData]);
//   };

//   // Sorting data
//   const sortFunc = (params) => {
//     let defaultData = data;
//     if (params === "asc") {
//       let sortedData = defaultData.sort((a, b) => a.name.localeCompare(b.name));
//       setData([...sortedData]);
//     } else if (params === "dsc") {
//       let sortedData = defaultData.sort((a, b) => b.name.localeCompare(a.name));
//       setData([...sortedData]);
//     }
//   };

//   // selects one product
//   const onSelectChange = (e, id) => {
//     let newData = data;
//     let index = newData.findIndex((item) => item.id === id);
//     newData[index].check = e.currentTarget.checked;
//     setData([...newData]);
//   };

//   // onChange function for searching name
//   const onFilterChange = (e) => {
//     setSearchText(e.target.value);
//   };

//   // function to delete a product
//   const deleteProduct = (id) => {
//     let defaultData = data;
//     defaultData = defaultData.filter((item) => item.id !== id);
//     setData([...defaultData]);
//   };

//   // function to delete the seletected item
//   const selectorDeleteProduct = () => {
//     let newData;
//     newData = data.filter((item) => item.check !== true);
//     setData([...newData]);
//   };

//   // toggle function to view product details
//   const toggle = (type) => {
//     setView({
//       edit: type === "edit" ? true : false,
//       add: type === "add" ? true : false,
//       details: type === "details" ? true : false,
//     });
//   };
//   const approveProduct = (id) => {
//     let newData = data;
//     let index = newData.findIndex((item) => item.id === id);
//     newData[index].status = "Active";
//     setData([...newData]);
//   };
//   // handles ondrop function of dropzone
//   const handleDropChange = (acceptedFiles) => {
//     setFiles(
//       acceptedFiles.map((file) =>
//         Object.assign(file, {
//           preview: URL.createObjectURL(file),
//         })
//       )
//     );
//   };

//   // function to filter data
//   const filterData = useCallback(() => {
//     if (Object.keys(filters).length === 0) {
//       return;
//     }
//     let newData = productData.filter((item) => {
//       return Object.keys(filters).every((key) => {
//         return filters[key] === item[key];
//       });
//     });
//     setData([...newData]);
//   }, [filters]);

//   // Get current list, pagination
//   const indexOfLastItem = currentPage * itemPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemPerPage;
//   const currentItems = data.slice(indexOfFirstItem, indexOfLastItem);
//   // Change Page
//   const paginate = (pageNumber) => setCurrentPage(pageNumber);

//   const {
//     register,
//     handleSubmit,
//     reset,
//     formState: { errors },
//   } = useForm({
//     defaultValues: {
//       name: "",
//       img: null,
//       seller: "",
//       price: 0,
//       productType: null,
//       category: null,
//       subcategory: "",
//       brand: "",
//       status: null,
//       check: false,
//     },
//   });

//   // console.log(errors);

//   // COLOR
//   const statusColor = useCallback(
//     (status) => {
//       if (status === "Pending" || status === "In Process" || status === "In Transit") {
//         return "warning";
//       } else if (status === "Inactive" || status === "Shipped") {
//         return "info";
//       } else if (status === "Active") {
//         return "success";
//       } else {
//         return "danger";
//       }
//     },
//     [currentItems]
//   );

//   return (
//     <React.Fragment>
//       <Head title="Stores"></Head>
//       <Content>
//         <BlockHead size="sm">
//           <BlockBetween>
//             <BlockHeadContent>
//               <BlockTitle>Stores/Businesses</BlockTitle>
//             </BlockHeadContent>
//             <BlockHeadContent>
//               <div className="toggle-wrap nk-block-tools-toggle">
//                 <a
//                   href="#more"
//                   className="btn btn-icon btn-trigger toggle-expand me-n1"
//                   onClick={(ev) => {
//                     ev.preventDefault();
//                     updateSm(!sm);
//                   }}
//                 >
//                   <Icon name="more-v"></Icon>
//                 </a>
//                 <div className="toggle-expand-content" style={{ display: sm ? "block" : "none" }}>
//                   <ul className="nk-block-tools g-3">
//                     {/* <li>
//                       <div className="form-control-wrap">
//                         <div className="form-icon form-icon-right">
//                           <Icon name="search"></Icon>
//                         </div>
//                         <input
//                           type="text"
//                           className="form-control"
//                           id="default-04"
//                           placeholder="Quick search by SKU"
//                           onChange={(e) => onFilterChange(e)}
//                         />
//                       </div>
//                     </li> */}
//                     {/* <li>
//                       <UncontrolledDropdown>
//                         <DropdownToggle
//                           color="transparent"
//                           className="dropdown-toggle dropdown-indicator btn btn-outline-light btn-white"
//                         >
//                           Status
//                         </DropdownToggle>
//                         <DropdownMenu end>
//                           <ul className="link-list-opt no-bdr">
//                             <li>
//                               <DropdownItem tag="a" href="#dropdownitem" onClick={(ev) => ev.preventDefault()}>
//                                 <span>New Items</span>
//                               </DropdownItem>
//                             </li>
//                             <li>
//                               <DropdownItem tag="a" href="#dropdownitem" onClick={(ev) => ev.preventDefault()}>
//                                 <span>Featured</span>
//                               </DropdownItem>
//                             </li>
//                             <li>
//                               <DropdownItem tag="a" href="#dropdownitem" onClick={(ev) => ev.preventDefault()}>
//                                 <span>Out of Stock</span>
//                               </DropdownItem>
//                             </li>
//                           </ul>
//                         </DropdownMenu>
//                       </UncontrolledDropdown>
//                     </li> */}
//                     <li className="nk-block-tools-opt">
//                       <Button
//                         className="toggle btn-icon d-md-none"
//                         color="primary"
//                         // onClick={() => {
//                         //   toggle("add");
//                         // }}
//                       >
//                         <Icon name="plus"></Icon>
//                       </Button>
//                       <Button
//                         className="toggle d-none d-md-inline-flex"
//                         color="primary"
//                         // onClick={() => {
//                         //   toggle("add");
//                         // }}
//                       >
//                         <Icon name="plus"></Icon>
//                         <span>Add Store</span>
//                       </Button>
//                     </li>
//                   </ul>
//                 </div>
//               </div>
//             </BlockHeadContent>
//           </BlockBetween>
//         </BlockHead>

//         <Block>
//           {/* <div className="nk-tb-list is-separate is-medium mb-3">
//             <DataTableHead className="nk-tb-item">
//               <DataTableRow className="nk-tb-col-check">
//                 <div className="custom-control custom-control-sm custom-checkbox notext">
//                   <input
//                     type="checkbox"
//                     className="custom-control-input"
//                     id="uid_1"
//                     onChange={(e) => selectorCheck(e)}
//                   />
//                   <label className="custom-control-label" htmlFor="uid_1"></label>
//                 </div>
//               </DataTableRow>
//               <DataTableRow size="sm">
//                 <span>Name</span>
//               </DataTableRow>
//               <DataTableRow>
//                 <span>SKU</span>
//               </DataTableRow>
//               <DataTableRow>
//                 <span>Price</span>
//               </DataTableRow>
//               <DataTableRow>
//                 <span>Stock</span>
//               </DataTableRow>
//               <DataTableRow size="md">
//                 <span>Category</span>
//               </DataTableRow>
//               <DataTableRow size="md">
//                 <Icon name="star-round" className="tb-asterisk"></Icon>
//               </DataTableRow>
//               <DataTableRow className="nk-tb-col-tools">
//                 <ul className="nk-tb-actions gx-1 my-n1">
//                   <li className="me-n1">
//                     <UncontrolledDropdown>
//                       <DropdownToggle
//                         tag="a"
//                         href="#toggle"
//                         onClick={(ev) => ev.preventDefault()}
//                         className="dropdown-toggle btn btn-icon btn-trigger"
//                       >
//                         <Icon name="more-h"></Icon>
//                       </DropdownToggle>
//                       <DropdownMenu end>
//                         <ul className="link-list-opt no-bdr">
//                           <li>
//                             <DropdownItem tag="a" href="#edit" onClick={(ev) => ev.preventDefault()}>
//                               <Icon name="edit"></Icon>
//                               <span>Edit Selected</span>
//                             </DropdownItem>
//                           </li>
//                           <li>
//                             <DropdownItem
//                               tag="a"
//                               href="#remove"
//                               onClick={(ev) => {
//                                 ev.preventDefault();
//                                 selectorDeleteProduct();
//                               }}
//                             >
//                               <Icon name="trash"></Icon>
//                               <span>Remove Selected</span>
//                             </DropdownItem>
//                           </li>
//                           <li>
//                             <DropdownItem tag="a" href="#stock" onClick={(ev) => ev.preventDefault()}>
//                               <Icon name="bar-c"></Icon>
//                               <span>Update Stock</span>
//                             </DropdownItem>
//                           </li>
//                           <li>
//                             <DropdownItem tag="a" href="#price" onClick={(ev) => ev.preventDefault()}>
//                               <Icon name="invest"></Icon>
//                               <span>Update Price</span>
//                             </DropdownItem>
//                           </li>
//                         </ul>
//                       </DropdownMenu>
//                     </UncontrolledDropdown>
//                   </li>
//                 </ul>
//               </DataTableRow>
//             </DataTableHead>
//             {currentItems.length > 0
//               ? currentItems.map((item) => {
//                   const categoryList = [];
//                   item.category.forEach((currentElement) => {
//                     categoryList.push(currentElement.label);
//                   });
//                   return (
//                     <DataTableItem key={item.id}>
//                       <DataTableRow className="nk-tb-col-check">
//                         <div className="custom-control custom-control-sm custom-checkbox notext">
//                           <input
//                             type="checkbox"
//                             className="custom-control-input"
//                             defaultChecked={item.check}
//                             id={item.id + "uid1"}
//                             key={Math.random()}
//                             onChange={(e) => onSelectChange(e, item.id)}
//                           />
//                           <label className="custom-control-label" htmlFor={item.id + "uid1"}></label>
//                         </div>
//                       </DataTableRow>
//                       <DataTableRow size="sm">
//                         <span className="tb-product">
//                           <img src={item.img ? item.img : ProductH} alt="product" className="thumb" />
//                           <span className="title">{item.name}</span>
//                         </span>
//                       </DataTableRow>
//                       <DataTableRow>
//                         <span className="tb-sub">{item.sku}</span>
//                       </DataTableRow>
//                       <DataTableRow>
//                         <span className="tb-sub">$ {item.price}</span>
//                       </DataTableRow>
//                       <DataTableRow>
//                         <span className="tb-sub">{item.stock}</span>
//                       </DataTableRow>
//                       <DataTableRow size="md">
//                         <span className="tb-sub">{categoryList.join(", ")}</span>
//                       </DataTableRow>
//                       <DataTableRow size="md">
//                         <div className="asterisk tb-asterisk">
//                           <a
//                             href="#asterisk"
//                             className={item.fav ? "active" : ""}
//                             onClick={(ev) => ev.preventDefault()}
//                           >
//                             <Icon name="star" className="asterisk-off"></Icon>
//                             <Icon name="star-fill" className="asterisk-on"></Icon>
//                           </a>
//                         </div>
//                       </DataTableRow>
//                       <DataTableRow className="nk-tb-col-tools">
//                         <ul className="nk-tb-actions gx-1 my-n1">
//                           <li className="me-n1">
//                             <UncontrolledDropdown>
//                               <DropdownToggle
//                                 tag="a"
//                                 href="#more"
//                                 onClick={(ev) => ev.preventDefault()}
//                                 className="dropdown-toggle btn btn-icon btn-trigger"
//                               >
//                                 <Icon name="more-h"></Icon>
//                               </DropdownToggle>
//                               <DropdownMenu end>
//                                 <ul className="link-list-opt no-bdr">
//                                   <li>
//                                     <DropdownItem
//                                       tag="a"
//                                       href="#edit"
//                                       onClick={(ev) => {
//                                         ev.preventDefault();
//                                         onEditClick(item.id);
//                                         toggle("edit");
//                                       }}
//                                     >
//                                       <Icon name="edit"></Icon>
//                                       <span>Edit Product</span>
//                                     </DropdownItem>
//                                   </li>
//                                   <li>
//                                     <DropdownItem
//                                       tag="a"
//                                       href="#view"
//                                       onClick={(ev) => {
//                                         ev.preventDefault();
//                                         onEditClick(item.id);
//                                         toggle("details");
//                                       }}
//                                     >
//                                       <Icon name="eye"></Icon>
//                                       <span>View Product</span>
//                                     </DropdownItem>
//                                   </li>
//                                   <li>
//                                     <DropdownItem
//                                       tag="a"
//                                       href="#remove"
//                                       onClick={(ev) => {
//                                         ev.preventDefault();
//                                         deleteProduct(item.id);
//                                       }}
//                                     >
//                                       <Icon name="trash"></Icon>
//                                       <span>Remove Product</span>
//                                     </DropdownItem>
//                                   </li>
//                                 </ul>
//                               </DropdownMenu>
//                             </UncontrolledDropdown>
//                           </li>
//                         </ul>
//                       </DataTableRow>
//                     </DataTableItem>
//                   );
//                 })
//               : null}
//           </div> */}
//           <DataTable className="card-stretch">
//             <div className="card-inner">
//               <div className="card-title-group">
//                 <div className="card-title">
//                   <h5 className="title">All Stores</h5>
//                 </div>
//                 <div className="card-tools me-n1">
//                   <ul className="btn-toolbar gx-1">
//                     <li>
//                       <Button
//                         href="#search"
//                         onClick={(ev) => {
//                           ev.preventDefault();
//                           setonSearch(true);
//                         }}
//                         className="btn-icon search-toggle toggle-search"
//                       >
//                         <Icon name="search"></Icon>
//                       </Button>
//                     </li>
//                     <li className="btn-toolbar-sep"></li>
//                     <li>
//                       <UncontrolledDropdown>
//                         <DropdownToggle tag="a" className="btn btn-trigger btn-icon dropdown-toggle">
//                           <div className="dot dot-primary"></div>
//                           <Icon name="filter-alt"></Icon>
//                         </DropdownToggle>
//                         <DropdownMenu end className="filter-wg dropdown-menu-xl" style={{ overflow: "visible" }}>
//                           <div className="dropdown-head">
//                             <span className="sub-title dropdown-title">Advanced Filter</span>
//                             {/* <div className="dropdown">
//                               <Button size="sm" className="btn-icon">
//                                 <Icon name="more-h"></Icon>
//                               </Button>
//                             </div> */}
//                           </div>
//                           <div className="dropdown-body dropdown-body-rg">
//                             <Row className="gx-6 gy-4">
//                               <Col size="6">
//                                 <div className="form-group">
//                                   <label className="overline-title overline-title-alt">Type</label>
//                                   <RSelect
//                                     options={filterProductType}
//                                     value={
//                                       filters.productType && { label: filters.productType, value: filters.productType }
//                                     }
//                                     placeholder="Product Type"
//                                     onChange={(e) => setfilters({ ...filters, productType: e.value })}
//                                   />
//                                 </div>
//                               </Col>
//                               <Col size="6">
//                                 <div className="form-group">
//                                   <label className="overline-title overline-title-alt">Status</label>
//                                   <RSelect
//                                     options={filterProductStatus}
//                                     placeholder="Any Status"
//                                     value={filters.status && { label: filters.status, value: filters.status }}
//                                     isSearchable={false}
//                                     onChange={(e) => setfilters({ ...filters, status: e.value })}
//                                   />
//                                 </div>
//                               </Col>
//                               {/* <Col size="6">
//                                 <div className="form-group">
//                                   <label className="overline-title overline-title-alt">Pay Currency</label>
//                                   <RSelect options={filterCoin} placeholder="Any coin" />
//                                 </div>
//                               </Col>
//                               <Col size="6">
//                                 <div className="form-group">
//                                   <label className="overline-title overline-title-alt">Method</label>
//                                   <RSelect options={filterPaymentmethod} placeholder="Any Method" />
//                                 </div>
//                               </Col> */}

//                               {/* <Col size="6">
//                                 <div className="form-group">
//                                   <div className="custom-control custom-control-sm custom-checkbox">
//                                     <input type="checkbox" className="custom-control-input" id="includeDel" />
//                                     <label className="custom-control-label" htmlFor="includeDel">
//                                       {" "}
//                                       Including Deleted
//                                     </label>
//                                   </div>
//                                 </div>
//                               </Col> */}

//                               <Col size="12">
//                                 <div className="form-group">
//                                   <Button type="button" onClick={filterData} className="btn btn-secondary">
//                                     Filter
//                                   </Button>
//                                 </div>
//                               </Col>
//                             </Row>
//                           </div>
//                           <div className="dropdown-foot between">
//                             <a
//                               href="#reset"
//                               onClick={(ev) => {
//                                 ev.preventDefault();
//                                 setData(productData);
//                                 setfilters({});
//                               }}
//                               className="clickable"
//                             >
//                               Reset Filter
//                             </a>
//                             <a
//                               href="#save"
//                               onClick={(ev) => {
//                                 ev.preventDefault();
//                               }}
//                             >
//                               Save Filter
//                             </a>
//                           </div>
//                         </DropdownMenu>
//                       </UncontrolledDropdown>
//                     </li>
//                     <li>
//                       <UncontrolledDropdown>
//                         <DropdownToggle tag="a" className="btn btn-trigger btn-icon dropdown-toggle">
//                           <Icon name="setting"></Icon>
//                         </DropdownToggle>
//                         <DropdownMenu end className="dropdown-menu-xs">
//                           <ul className="link-check">
//                             <li>
//                               <span>Show</span>
//                             </li>
//                             <li className={itemPerPage === 10 ? "active" : ""}>
//                               <DropdownItem
//                                 tag="a"
//                                 href="#dropdownitem"
//                                 onClick={(ev) => {
//                                   ev.preventDefault();
//                                   setItemPerPage(10);
//                                 }}
//                               >
//                                 10
//                               </DropdownItem>
//                             </li>
//                             <li className={itemPerPage === 15 ? "active" : ""}>
//                               <DropdownItem
//                                 tag="a"
//                                 href="#dropdownitem"
//                                 onClick={(ev) => {
//                                   ev.preventDefault();
//                                   setItemPerPage(15);
//                                 }}
//                               >
//                                 15
//                               </DropdownItem>
//                             </li>
//                           </ul>
//                           <ul className="link-check">
//                             <li>
//                               <span>Order</span>
//                             </li>
//                             <li className={sort === "dsc" ? "active" : ""}>
//                               <DropdownItem
//                                 tag="a"
//                                 href="#dropdownitem"
//                                 onClick={(ev) => {
//                                   ev.preventDefault();
//                                   setSortState("dsc");
//                                   sortFunc("dsc");
//                                 }}
//                               >
//                                 DESC
//                               </DropdownItem>
//                             </li>
//                             <li className={sort === "asc" ? "active" : ""}>
//                               <DropdownItem
//                                 tag="a"
//                                 href="#dropdownitem"
//                                 onClick={(ev) => {
//                                   ev.preventDefault();
//                                   setSortState("asc");
//                                   sortFunc("asc");
//                                 }}
//                               >
//                                 ASC
//                               </DropdownItem>
//                             </li>
//                           </ul>
//                         </DropdownMenu>
//                       </UncontrolledDropdown>
//                     </li>
//                   </ul>
//                 </div>
//                 <div className={`card-search search-wrap ${onSearch && "active"}`}>
//                   <div className="search-content">
//                     <Button
//                       onClick={() => {
//                         setSearchText("");
//                         setonSearch(false);
//                       }}
//                       className="search-back btn-icon toggle-search"
//                     >
//                       <Icon name="arrow-left"></Icon>
//                     </Button>
//                     <input
//                       type="text"
//                       className="border-transparent form-focus-none form-control"
//                       placeholder="Search by Product name"
//                       value={onSearchText}
//                       onChange={(e) => onFilterChange(e)}
//                     />
//                     <Button className="search-submit btn-icon">
//                       <Icon name="search"></Icon>
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//             <DataTableBody bodyclass="nk-tb-tnx">
//               <DataTableHead className="nk-tb-item">
//                 <DataTableRow className="nk-tb-col-check">
//                   <div className="custom-control custom-control-sm custom-checkbox notext">
//                     <input
//                       type="checkbox"
//                       className="custom-control-input"
//                       id="pid-all"
//                       onChange={(e) => selectorCheck(e)}
//                     />
//                     <label className="custom-control-label" htmlFor="pid-all"></label>
//                   </div>
//                 </DataTableRow>
//                 {/* <DataTableRow>
//                   <span className="sub-text">Order</span>
//                 </DataTableRow>
//                 <DataTableRow size="md">
//                   <span className="sub-text">Date</span>
//                 </DataTableRow>
//                 <DataTableRow>
//                   <span className="sub-text">Status</span>
//                 </DataTableRow>
//                 <DataTableRow size="sm">
//                   <span className="sub-text">Customer</span>
//                 </DataTableRow>
//                 <DataTableRow size="md">
//                   <span className="sub-text">Purchased</span>
//                 </DataTableRow>
//                 <DataTableRow>
//                   <span className="sub-text">Total</span>
//                 </DataTableRow> */}

//                 {/* TABLE HEADING */}
//                 <DataTableRow>
//                   <span className="sub-text">Name</span>
//                 </DataTableRow>
//                 <DataTableRow size="md">
//                   <span className="sub-text">Seller</span>
//                 </DataTableRow>
//                 <DataTableRow>
//                   <span className="sub-text">Category</span>
//                 </DataTableRow>
//                 {/* <DataTableRow size="sm">
//                   <span className="sub-text">Subcategory</span>
//                 </DataTableRow> */}
//                 <DataTableRow>
//                   <span className="sub-text">Brand</span>
//                 </DataTableRow>
//                 <DataTableRow>
//                   <span className="sub-text">Product type</span>
//                 </DataTableRow>
//                 <DataTableRow>
//                   <span className="sub-text">Price</span>
//                 </DataTableRow>
//                 <DataTableRow>
//                   <span className="sub-text">Status</span>
//                 </DataTableRow>
//                 <DataTableRow className="nk-tb-col-tools">
//                   <ul className="nk-tb-actions gx-1 my-n1">
//                     <li>
//                       <UncontrolledDropdown>
//                         <DropdownToggle tag="a" className="btn btn-trigger dropdown-toggle btn-icon me-n1">
//                           <Icon name="more-h"></Icon>
//                         </DropdownToggle>
//                         <DropdownMenu end>
//                           <ul className="link-list-opt no-bdr">
//                             <li>
//                               <DropdownItem
//                                 tag="a"
//                                 href="#markasdone"
//                                 onClick={(ev) => {
//                                   ev.preventDefault();
//                                   // selectorMarkAsDelivered();
//                                 }}
//                               >
//                                 <Icon name="truck"></Icon>
//                                 <span>Approve</span>
//                               </DropdownItem>
//                             </li>
//                             <li>
//                               <DropdownItem
//                                 tag="a"
//                                 href="#remove"
//                                 onClick={(ev) => {
//                                   ev.preventDefault();
//                                   // selectorDeleteOrder();
//                                 }}
//                               >
//                                 <Icon name="trash"></Icon>
//                                 <span>Remove Products</span>
//                               </DropdownItem>
//                             </li>
//                           </ul>
//                         </DropdownMenu>
//                       </UncontrolledDropdown>
//                     </li>
//                   </ul>
//                 </DataTableRow>
//               </DataTableHead>

//               {currentItems.length > 0
//                 ? currentItems.map((item) => (
//                     <DataTableItem key={item.id}>
//                       <DataTableRow className="nk-tb-col-check">
//                         <div className="custom-control custom-control-sm custom-checkbox notext">
//                           <input
//                             type="checkbox"
//                             className="custom-control-input"
//                             defaultChecked={item.check}
//                             id={item.id + "pid-all"}
//                             key={Math.random()}
//                             onChange={(e) => onSelectChange(e, item.id)}
//                           />
//                           <label className="custom-control-label" htmlFor={item.id + "pid-all"}></label>
//                         </div>
//                       </DataTableRow>
//                       <DataTableRow size="sm">
//                         <span className="tb-product">
//                           <img src={item.img ? item.img : ProductH} alt="product" className="thumb" />
//                           <span className="">{item.name}</span>
//                         </span>
//                       </DataTableRow>
//                       <DataTableRow size="sm">
//                         <span className="tb-sub">{item.seller}</span>
//                       </DataTableRow>
//                       <DataTableRow>
//                         <span className="tb-sub">{item.category}</span>
//                       </DataTableRow>
//                       {/* <DataTableRow size="md">
//                         <span className="tb-sub">{item.subcategory}</span>
//                       </DataTableRow> */}
//                       <DataTableRow size="md">
//                         <span className="tb-sub">{item.brand}</span>
//                       </DataTableRow>
//                       <DataTableRow size="md">
//                         <span className="tb-sub">{item.productType}</span>
//                       </DataTableRow>
//                       <DataTableRow size="sm">
//                         <span className="tb-sub">{item.price}</span>
//                       </DataTableRow>
//                       <DataTableRow>
//                         <span
//                           className={`dot bg-${item.status === "Delivered" ? "success" : "warning"} d-sm-none`}
//                         ></span>
//                         <Badge
//                           className="badge-sm badge-dot has-bg d-none d-sm-inline-flex"
//                           color={statusColor(item.status)}
//                         >
//                           {item.status}
//                         </Badge>
//                       </DataTableRow>

//                       {/* <DataTableRow size="md">
//                         <span className="tb-sub text-primary">{item.purchased}</span>
//                       </DataTableRow> */}

//                       {/* <DataTableRow size="md">
//                         <span>{item.date}</span>
//                       </DataTableRow> */}
//                       <DataTableRow className="nk-tb-col-tools">
//                         <ul className="nk-tb-actions gx-1">
//                           {/* {item.status !== "Delivered" && (
//                             <li className="nk-tb-action-hidden" onClick={() => markAsDelivered(item.id)}>
//                               <TooltipComponent
//                                 tag="a"
//                                 containerClassName="btn btn-trigger btn-icon"
//                                 id={"delivery" + item.id}
//                                 icon="truck"
//                                 direction="top"
//                                 text="Mark as Delivered"
//                               />
//                             </li>
//                           )}
//                           <li
//                             className="nk-tb-action-hidden"
//                             onClick={() => {
//                               loadDetail(item.id);
//                               toggle("details");
//                             }}
//                           >
//                             <TooltipComponent
//                               tag="a"
//                               containerClassName="btn btn-trigger btn-icon"
//                               id={"view" + item.id}
//                               icon="eye"
//                               direction="top"
//                               text="Quick View"
//                             />
//                           </li> */}
//                           <li>
//                             <UncontrolledDropdown>
//                               <DropdownToggle tag="a" className="btn btn-icon dropdown-toggle btn-trigger">
//                                 <Icon name="more-h"></Icon>
//                               </DropdownToggle>
//                               <DropdownMenu end>
//                                 <ul className="link-list-opt no-bdr">
//                                   <li>
//                                     <DropdownItem
//                                       tag="a"
//                                       href="#productdetail"
//                                       onClick={(ev) => {
//                                         ev.preventDefault();
//                                         navigate(`${import.meta.env.PUBLIC_URL}/product-details/${item.id}`);
//                                         // loadDetail(item.id);
//                                         // toggle("details");
//                                       }}
//                                     >
//                                       <Icon name="eye"></Icon>
//                                       <span>View Products</span>
//                                     </DropdownItem>
//                                   </li>
//                                   <li>
//                                     <DropdownItem
//                                       tag="a"
//                                       href="#dropdown"
//                                       onClick={(ev) => {
//                                         ev.preventDefault();
//                                         navigate(`${import.meta.env.PUBLIC_URL}/product-reviews/${item.id}`);

//                                         // deleteOrder(item.id);
//                                       }}
//                                     >
//                                       <Icon name="star"></Icon>
//                                       <span>View Ratings</span>
//                                     </DropdownItem>
//                                   </li>
//                                   {item.status === "Pending" && (
//                                     <li>
//                                       <DropdownItem
//                                         tag="a"
//                                         href="#dropdown"
//                                         onClick={(ev) => {
//                                           ev.preventDefault();
//                                           approveProduct(item.id);
//                                         }}
//                                       >
//                                         <Icon name="thumbs-up"></Icon>
//                                         <span>Approve</span>
//                                       </DropdownItem>
//                                     </li>
//                                   )}
//                                   <li>
//                                     <DropdownItem
//                                       tag="a"
//                                       href="#dropdown"
//                                       onClick={(ev) => {
//                                         ev.preventDefault();
//                                         onEditClick(item.id);
//                                         // deleteOrder(item.id);
//                                       }}
//                                     >
//                                       <Icon name="edit"></Icon>
//                                       <span>Edit</span>
//                                     </DropdownItem>
//                                   </li>
//                                   <li>
//                                     <DropdownItem
//                                       tag="a"
//                                       href="#dropdown"
//                                       onClick={(ev) => {
//                                         ev.preventDefault();
//                                         deleteProduct(item.id);
//                                       }}
//                                     >
//                                       <Icon name="trash"></Icon>
//                                       <span>Delete</span>
//                                     </DropdownItem>
//                                   </li>
//                                 </ul>
//                               </DropdownMenu>
//                             </UncontrolledDropdown>
//                           </li>
//                         </ul>
//                       </DataTableRow>
//                     </DataTableItem>
//                   ))
//                 : null}
//             </DataTableBody>
//             <PreviewAltCard>
//               {data.length > 0 ? (
//                 <PaginationComponent
//                   itemPerPage={itemPerPage}
//                   totalItems={data.length}
//                   paginate={paginate}
//                   currentPage={currentPage}
//                 />
//               ) : (
//                 <div className="text-center">
//                   <span className="text-silent">No products found</span>
//                 </div>
//               )}
//             </PreviewAltCard>
//           </DataTable>
//         </Block>

//         <Modal isOpen={view.edit} toggle={() => onFormCancel()} className="modal-dialog-centered" size="lg">
//           <ModalBody>
//             <a href="#cancel" className="close">
//               {" "}
//               <Icon
//                 name="cross-sm"
//                 onClick={(ev) => {
//                   ev.preventDefault();
//                   onFormCancel();
//                 }}
//               ></Icon>
//             </a>
//             <div className="p-2">
//               <h5 className="title">Update Product</h5>
//               <div className="mt-4">
//                 <form onSubmit={handleSubmit(onEditSubmit)}>
//                   <Row className="g-3">
//                     <Col size="12">
//                       <div className="form-group">
//                         <label className="form-label" htmlFor="product-title">
//                           Product Title
//                         </label>
//                         <div className="form-control-wrap">
//                           <input
//                             type="text"
//                             className="form-control"
//                             {...register("name", {
//                               required: "This field is required",
//                             })}
//                             value={formData.name}
//                             onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                           />
//                           {errors.name && <span className="invalid">{errors.name.message}</span>}
//                         </div>
//                       </div>
//                     </Col>
//                     <Col size="12">
//                       <div className="form-group">
//                         <label className="form-label" htmlFor="sale-price">
//                           Seller
//                         </label>
//                         <div className="form-control-wrap">
//                           <input
//                             type="text"
//                             className="form-control"
//                             {...register("seller")}
//                             value={formData.seller}
//                             onChange={(e) => setFormData({ ...formData, seller: e.target.value })}
//                             disabled
//                           />
//                           {errors.seller && <span className="invalid">{errors.seller.message}</span>}
//                         </div>
//                       </div>
//                     </Col>

//                     <Col md="6">
//                       <div className="form-group">
//                         <label className="form-label" htmlFor="regular-price">
//                           Price
//                         </label>
//                         <div className="form-control-wrap">
//                           <input
//                             type="number"
//                             {...register("price", { required: "This is required" })}
//                             className="form-control"
//                             value={formData.price}
//                             onChange={(e) => setFormData({ ...formData, price: e.target.value })}
//                           />
//                           {errors.price && <span className="invalid">{errors.price.message}</span>}
//                         </div>
//                       </div>
//                     </Col>

//                     <Col md="6">
//                       <div className="form-group">
//                         <label className="form-label" htmlFor="productType">
//                           Status
//                         </label>
//                         <div className="form-control-wrap">
//                           <RSelect
//                             options={statusOptions}
//                             value={formData.status}
//                             onChange={(value) => setFormData({ ...formData, status: value })}
//                             //ref={register({ required: "This is required" })}
//                           />
//                           {errors.status && <span className="invalid">{errors.status.message}</span>}
//                         </div>
//                       </div>
//                     </Col>
//                     <Col md="6">
//                       <div className="form-group">
//                         <label className="form-label" htmlFor="brand">
//                           Brand
//                         </label>
//                         <div className="form-control-wrap">
//                           <input
//                             type="text"
//                             className="form-control"
//                             {...register("brand", { required: "This is required" })}
//                             value={formData.brand}
//                             onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
//                           />
//                           {errors.brand && <span className="invalid">{errors.brand.message}</span>}
//                         </div>
//                       </div>
//                     </Col>
//                     <Col md="6">
//                       <div className="form-group">
//                         <label className="form-label" htmlFor="productType">
//                           Product Type
//                         </label>
//                         <div className="form-control-wrap">
//                           <RSelect
//                             options={productTypeOptions}
//                             value={formData.productType}
//                             onChange={(value) => setFormData({ ...formData, productType: value })}
//                             //ref={register({ required: "This is required" })}
//                           />
//                           {errors.productType && <span className="invalid">{errors.productType.message}</span>}
//                         </div>
//                       </div>
//                     </Col>

//                     <Col size="6">
//                       <div className="form-group">
//                         <label className="form-label" htmlFor="category">
//                           Category
//                         </label>
//                         <div className="form-control-wrap">
//                           <RSelect
//                             // isMulti
//                             options={categoryOptions}
//                             value={formData.category}
//                             onChange={(value) => setFormData({ ...formData, category: value })}
//                             //ref={register({ required: "This is required" })}
//                           />
//                           {errors.category && <span className="invalid">{errors.category.message}</span>}
//                         </div>
//                       </div>
//                     </Col>
//                     <Col md="6">
//                       <div className="form-group">
//                         <label className="form-label" htmlFor="subcategory">
//                           Subcategory
//                         </label>
//                         <div className="form-control-wrap">
//                           <input
//                             type="text"
//                             className="form-control"
//                             {...register("subcategory", { required: "This is required" })}
//                             value={formData.subcategory}
//                             onChange={(e) => setFormData({ ...formData, subcategory: e.target.value })}
//                           />
//                           {errors.subcategory && <span className="invalid">{errors.subcategory.message}</span>}
//                         </div>
//                       </div>
//                     </Col>
//                     <Col size="6">
//                       <div className="form-group">
//                         <label className="form-label" htmlFor="category">
//                           Product Image
//                         </label>
//                         <div className="form-control-wrap">
//                           <img src={formData.img} alt=""></img>
//                         </div>
//                       </div>
//                     </Col>
//                     <Col size="6">
//                       <Dropzone onDrop={(acceptedFiles) => handleDropChange(acceptedFiles)}>
//                         {({ getRootProps, getInputProps }) => (
//                           <section>
//                             <div
//                               {...getRootProps()}
//                               className="dropzone upload-zone small bg-lighter my-2 dz-clickable"
//                             >
//                               <input {...getInputProps()} />
//                               {files.length === 0 && <p>Drag 'n' drop some files here, or click to select files</p>}
//                               {files.map((file) => (
//                                 <div
//                                   key={file.name}
//                                   className="dz-preview dz-processing dz-image-preview dz-error dz-complete"
//                                 >
//                                   <div className="dz-image">
//                                     <img src={file.preview} alt="preview" />
//                                   </div>
//                                 </div>
//                               ))}
//                             </div>
//                           </section>
//                         )}
//                       </Dropzone>
//                     </Col>

//                     <Col size="12">
//                       <Button color="primary" type="submit">
//                         <Icon className="plus"></Icon>
//                         <span>Update Product</span>
//                       </Button>
//                     </Col>
//                   </Row>
//                 </form>
//               </div>
//             </div>
//           </ModalBody>
//         </Modal>

//         {/* <Modal isOpen={view.details} toggle={() => onFormCancel()} className="modal-dialog-centered" size="lg">
//           <ModalBody>
//             <a href="#cancel" className="close">
//               {" "}
//               <Icon
//                 name="cross-sm"
//                 onClick={(ev) => {
//                   ev.preventDefault();
//                   onFormCancel();
//                 }}
//               ></Icon>
//             </a>
//             <div className="nk-modal-head">
//               <h4 className="nk-modal-title title">
//                 Product <small className="text-primary">#{formData.sku}</small>
//               </h4>
//               <img src={formData.img} alt="" />
//             </div>
//             <div className="nk-tnx-details mt-sm-3">
//               <Row className="gy-3">
//                 <Col lg={6}>
//                   <span className="sub-text">Product Name</span>
//                   <span className="caption-text">{formData.name}</span>
//                 </Col>
//                 <Col lg={6}>
//                   <span className="sub-text">Product Price</span>
//                   <span className="caption-text">$ {formData.price}</span>
//                 </Col>
//                 <Col lg={6}>
//                   <span className="sub-text">Product Category</span> */}
//         {/* <span className="caption-text">
//                     {formData.category.map((item, index) => (
//                       <Badge key={index} className="me-1" color="secondary">
//                         {item.value}
//                       </Badge>
//                     ))}
//                   </span> */}
//         {/* </Col>
//                 <Col lg={6}>
//                   <span className="sub-text">Stock</span>
//                   <span className="caption-text"> {formData.stock}</span>
//                 </Col>
//               </Row>
//             </div>
//           </ModalBody>
//         </Modal> */}

//         {view.add && <div className="toggle-overlay" onClick={toggle}></div>}
//       </Content>
//     </React.Fragment>
//   );
// };

// export default StoreListPage;
