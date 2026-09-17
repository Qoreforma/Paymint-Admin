export const ServicesFilterOptions = [
  {
    name: "status",
    label: "Status",
    options: [
      { value: "", label: "All Status" },
      { value: "success", label: "Successful" },
      { value: "pending", label: "Pending" },
      { value: "processing", label: "Processing" },
      { value: "failed", label: "Failed" },
      { value: "reversed", label: "Reversed" },
    ],
  },
  {
    name: "channel",
    label: "Channel",
    options: [
      { value: "", label: "All Channels" },
      { value: "ios", label: "iOS" },
      { value: "android", label: "Android" },
      { value: "web", label: "Web" },
      { value: "api", label: "API" },
    ],
  },
];

export const ProviderFilterOptions = {
  name: "provider",
  label: "Provider",
  options: [
    { value: "", label: "All Providers" },
    { value: "airvend", label: "Airvend" },
    { value: "vtpass", label: "VTpass" },
    { value: "clubkonnect", label: "Clubkonnect" },
    { value: "buypower", label: "BuyPower" },
    { value: "shago", label: "Shago" },
    { value: "pairgate", label: "Pairgate" },
    { value: "coolsub", label: "CoolSub" },
    { value: "bilalsadasub", label: "BilalSadaSub" },
    { value: "monnify", label: "Monnify" },
    { value: "safehaven", label: "SafeHaven" },
  ],
};

export const NetworkFilterOptions = {
  name: "service",
  label: "Network",
  options: [
    { value: "", label: "All Networks" },
    { value: "mtn", label: "MTN" },
    { value: "airtel", label: "Airtel" },
    { value: "glo", label: "GLO" },
    { value: "9mobile", label: "9mobile" },
  ],
};

export const ElectricityFilterOptions = {
  name: "service",
  label: "Electricity DisCo",
  options: [
    { value: "", label: "All DisCos" },
    { value: "ibedc", label: "IBEDC (Ibadan)" },
    { value: "ikeja", label: "IKEDC (Ikeja)" },
    { value: "eko", label: "EKEDC (Eko)" },
    { value: "aedc", label: "AEDC (Abuja)" },
    { value: "kedco", label: "KEDCO (Kano)" },
    { value: "phed", label: "PHED (Port Harcourt)" },
    { value: "eedc", label: "EEDC (Enugu)" },
    { value: "jos", label: "JED (Jos)" },
    { value: "kaduna", label: "KAEDCO (Kaduna)" },
    { value: "bedc", label: "BEDC (Benin)" },
    { value: "yedc", label: "YEDC (Yola)" },
    { value: "aba", label: "Aba Power" },
  ],
};

export const CableTvFilterOptions = {
  name: "service",
  label: "Cable TV Operator",
  options: [
    { value: "", label: "All Operators" },
    { value: "dstv", label: "DStv" },
    { value: "gotv", label: "GOtv" },
    { value: "startimes", label: "StarTimes" },
    { value: "showmax", label: "Showmax" },
  ],
};

export const BettingFilterOptions = {
  name: "service",
  label: "Betting Platform",
  options: [
    { value: "", label: "All Platforms" },
    { value: "sportybet", label: "SportyBet" },
    { value: "bet9ja", label: "Bet9ja" },
    { value: "1xbet", label: "1xBet" },
    { value: "bangbet", label: "BangBet" },
    { value: "betway", label: "Betway" },
    { value: "nairabet", label: "NairaBet" },
    { value: "merrybet", label: "MerryBet" },
    { value: "livescore", label: "LiveScore Bet" },
  ],
};

export const EducationFilterOptions = {
  name: "service",
  label: "Exam Board",
  options: [
    { value: "", label: "All Boards" },
    { value: "waec", label: "WAEC" },
    { value: "jamb", label: "JAMB" },
    { value: "neco", label: "NECO" },
    { value: "nabteb", label: "NABTEB" },
  ],
};

export const ServiceTypeFilterOptions = {
  name: "serviceType",
  label: "Service Type",
  options: [
    { value: "", label: "All Services" },
    { value: "airtime", label: "Airtime" },
    { value: "data", label: "Data" },
    { value: "electricity", label: "Electricity" },
    { value: "cable_tv", label: "Cable TV" },
    { value: "betting", label: "Betting" },
    { value: "education", label: "Education" },
    { value: "airtime_cash", label: "Airtime to Cash" },
    { value: "airtime_epin", label: "Airtime E-PIN" },
    { value: "data_epin", label: "Data E-PIN" },
    { value: "internationalairtime", label: "Int. Airtime" },
    { value: "internationaldata", label: "Int. Data" },
  ],
};

export const getServiceFilterOptions = (type, purpose) => {
  const currentType = (type || purpose || "").toLowerCase();

  const options = [
    ServicesFilterOptions[0], // status
    ServicesFilterOptions[1], // channel
    ProviderFilterOptions, // provider
  ];

  if (currentType.includes("data") || currentType.includes("airtime")) {
    options.splice(2, 0, NetworkFilterOptions);
  } else if (currentType.includes("elect")) {
    options.splice(2, 0, ElectricityFilterOptions);
  } else if (currentType.includes("cable") || currentType.includes("tv")) {
    options.splice(2, 0, CableTvFilterOptions);
  } else if (currentType.includes("bet")) {
    options.splice(2, 0, BettingFilterOptions);
  } else if (currentType.includes("edu")) {
    options.splice(2, 0, EducationFilterOptions);
  } else if (currentType === "all" || !currentType) {
    options.unshift(ServiceTypeFilterOptions);
  }

  return options;
};

