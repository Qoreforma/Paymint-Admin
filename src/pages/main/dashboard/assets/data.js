export const assetFilterOptions = [
  {
    name: "status",
    options: [
      { value: "", label: "All" },
      { value: "pending", label: "Pending" },
      { value: "approved", label: "Approved" },
      { value: "s.approved", label: "Sec.approved" },
      { value: "transferred", label: "Transferred" },
      { value: "failed", label: "Failed" },
      { value: "declined", label: "Declined" },
    ],
  },
  {
    name: "channel",
    options: [
      { value: "ios", label: "IOS" },
      { value: "android", label: "Android" },
      { value: "web", label: "Web" },
      { value: "api", label: "API" },
    ],
  },
];
