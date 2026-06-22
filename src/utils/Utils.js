import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

//url for production
export var url = "";
if (import.meta.env.NODE_ENV === "development") {
  url = "";
} else {
  url = window.location.host.split("/")[1];
  if (url) {
    url = `/${window.location.host.split("/")[1]}`;
  } else url = import.meta.env.VITE_APP_PUBLIC_URL; /// ADD YOUR CPANEL SUB-URL
}

//Function to validate and return errors for a form
export const checkForm = (formData) => {
  let errorState = {};
  Object.keys(formData).forEach((item) => {
    if (formData[item] === null || formData[item] === "") {
      errorState[item] = "This field is required";
    }
  });
  return errorState;
};

//Function that returns the first or first two letters from a name
export const findUpper = (string) => {
  let extractedString = [];

  for (var i = 0; i < string.length; i++) {
    if (string.charAt(i) === string.charAt(i).toUpperCase() && string.charAt(i) !== " ") {
      extractedString.push(string.charAt(i));
    }
  }
  if (extractedString.length > 1) {
    return extractedString[0] + extractedString[1];
  } else {
    return extractedString[0];
  }
};

//Function that calculates the from current date
export const setDeadline = (days) => {
  let todayDate = new Date();
  var newDate = new Date(todayDate);
  newDate.setDate(newDate.getDate() + days);
  return newDate;
};

// Function to set deadline for projects
export const setDeadlineDays = (deadline) => {
  var currentDate = new Date();
  var difference = deadline.getTime() - currentDate.getTime();
  var days = Math.ceil(difference / (1000 * 3600 * 24));
  return days;
};

//Date formatter function
export const dateFormatterAlt = (date, reverse) => {
  let d = date.getDate();
  let m = date.getMonth();
  let y = date.getFullYear();
  reverse ? (date = m + "-" + d + "-" + y) : (date = y + "-" + d + "-" + m);
  return date;
};

//Date formatter function
export const dateFormatter = (date, reverse) => {
  var dateformat = date.split("-");
  //var date = dateformat[1]+"-"+dateformat[2]+"-"+dateformat[0];
  reverse
    ? (date = dateformat[2] + "-" + dateformat[0] + "-" + dateformat[1])
    : (date = dateformat[1] + "-" + dateformat[2] + "-" + dateformat[0]);
  return date;
};

//Month Names
export const monthNames = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

//todays Date
export const todaysDate = new Date();

// Function to structure date ex : Jun 4, 2011;
export const getDateStructured = (date) => {
  let d = date.getDate();
  let m = date.getMonth();
  let y = date.getFullYear();
  let final = monthNames[m] + " " + d + ", " + y;
  return final;
};

export const getDateStructure = (date) => {
  return new Date(date).toLocaleDateString("en-CA", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

// Function to structure date ex: YYYY-MM-DD
export const setDateForPicker = (rdate) => {
  let d = rdate.getDate();
  d < 10 && (d = "0" + d);
  let m = rdate.getMonth() + 1;
  m < 10 && (m = "0" + m);
  let y = rdate.getFullYear();
  rdate = y + "-" + m + "-" + d;

  return rdate;
};

//current Time
export const currentTime = () => {
  var hours = todaysDate.getHours();
  var minutes = todaysDate.getMinutes();
  var ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes;
  var strTime = hours + ":" + minutes + " " + ampm;
  return strTime;
};

//Percentage calculation
export const calcPercentage = (str1, str2) => {
  let result = Number(str2) / Number(str1);
  result = result * 100;
  return Math.floor(result);
};

//shortens a long string
export const truncate = (str, n) => {
  return str.length > n ? str.substr(0, n - 1) + " " + truncate(str.substr(n - 1, str.length), n) : str;
};

//shortens a long sentence
export const truncateText = (value, limit) => {
  return value.length > 20 ? value.substring(0, limit) + "..." : value;
};

// returns upload url
export const getUploadParams = () => {
  return { url: "https://httpbin.org/post" };
};

// Converts KB to MB
export const bytesToMegaBytes = (bytes) => {
  let result = bytes / (1024 * 1024);
  return result.toFixed(2);
};

export const bulkActionOptions = [
  { value: "suspend", label: "Suspend User" },
  { value: "delete", label: "Delete User" },
];

export const formatter = (currency = "USD", fractiondigit = 4) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: 0,
    maximumFractionDigits: fractiondigit,
  });

export const formatDate = (str) => {
  return new Date(str).toLocaleDateString("en-us", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

export const formatDateNumeric = (str) => {
  return new Date(str).toLocaleDateString("en-ca", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

export const formatDateTimeNumeric = (str) => {
  return new Date(str).toLocaleDateString("en-ca", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

export const formatDateWithTime = (str) => {
  return new Date(str).toLocaleDateString("en-us", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    // hour12: false,
  });
};

export const formatDateToISO = (dateString) => {
  const date = new Date(dateString);
  return date.toISOString();
};

export const formatCurrency = (value, country = "en-NG", currency = "NGN", fraction = 2) =>
  new Intl.NumberFormat(country, {
    style: "currency",
    currency: currency,
    minimumFractionDigits: fraction,
  }).format(value);

export const objectToQueryString = (obj) =>
  Object.entries(obj)
    .map(([k, v]) => `${k}=${v}`)
    .join("&");

export const capitalizeFirstLetter = (word) => {
  if (!word) return "";
  return word.charAt(0).toUpperCase() + word.slice(1);
};

export const tableNumbers = (currentPage = 1, itemsPerPage = 0) => {
  return (currentPage - 1) * itemsPerPage;
};

export const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (error) {
    return false;
  }
};

export const formatDateWithHyphen = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

  const month = months[date.getMonth()];
  const day = String(date.getDate()).padStart(2, "0");
  const year = date.getFullYear();

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");

  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  return `${month} ${day}, ${year} - ${hours}:${minutes} ${ampm}`;
};

export const formatHash = (hash, startLength = 10, endLength = 4) => {
  if (!hash) return "";
  if (hash.length <= startLength + endLength) return hash;
  return `${hash.slice(0, startLength)}...${hash.slice(-endLength)}`;
};

//DATA EXPORT
export const exportToCSV = (data, filename = "data.csv") => {
  if (!data.length) return;

  const headers = Object.keys(data[0]);

  const csvRows = [
    headers.join(","), // header row
    ...data.map((row) => headers.map((field) => JSON.stringify(row[field] ?? "")).join(",")),
  ];

  const blob = new Blob([csvRows.join("\n")], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
};

export const exportToExcel = (data, filename = "data.xlsx") => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");

  XLSX.writeFile(workbook, filename);
};

export const exportToPDF = (data, filename = "report.pdf") => {
  const doc = new jsPDF();

  const headers = Object.keys(data[0]);
  const rows = data.map((row) => headers.map((h) => row[h]));

  autoTable(doc, {
    head: [headers],
    body: rows,
  });

  doc.save(filename);
};
