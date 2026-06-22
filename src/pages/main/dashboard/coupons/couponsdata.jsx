export const couponsData = [
  {
    id: 1,
    code: "Skyrun",
    discount: "3",
    startDate: "June 1, 2022",
    endDate: "June 1, 2023",
    targetCount: 500,
    status: "Pending",
  },
  {
    id: 2,
    code: "Oriamo",
    discount: "8",
    startDate: "February 1, 2020",
    endDate: "June 1, 2021",
    targetCount: 1000,
    status: "Expired",
  },
  {
    id: 3,
    code: "Mike",
    discount: "20",
    startDate: "April 2, 2023",
    endDate: "August 1, 2023",
    targetCount: 100,
    status: "Active",
  },
  {
    id: 4,
    code: "Cway",
    discount: "15",
    startDate: "June 2, 2023",
    endDate: "July 20, 2023",
    targetCount: 60,
    status: "Used",
  },
];

export const couponStatusOptions = [
  { label: "Pending", value: "Pending" },
  { label: "Active", value: "Active" },
  { label: "Used", value: "Used" },
  { label: "Expired", value: "Expired" },
];
