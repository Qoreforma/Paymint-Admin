const menu = [
  {
    heading: "Welcome",
    show: "all",
    // show: ["dashboard", "crypto-transactions", "giftcard-transactions", "wallet-transactions", "transactions"],
  },
  {
    icon: "dashboard-fill",
    text: "Dashboard",
    link: "/",
    permission: "all",
  },
  // {
  //   icon: "sign-btc-alt",
  //   text: "Assets Transactions",
  //   permission: "all",
  //   subMenu: [
  //     {
  //       text: "All",
  //       link: "/assets/all",
  //       permission: "all",
  //     },
  //     {
  //       text: "Buy",
  //       link: "/assets/buy",
  //       permission: "all",
  //     },
  //     {
  //       text: "Sell",
  //       link: "/assets/sell",
  //       permission: "all",
  //     },
  //   ],
  // },
  // {
  //   icon: "cc-jcb",
  //   text: "Giftcard Transactions",
  //   permission: "giftcards.view",
  //   link: "/giftcards/all",
  //   subMenu: [
  //     {
  //       link: "/giftcards/all",
  //       text: "All",
  //       permission: "all",
  //     },
  //     {
  //       text: "Buy",
  //       link: "/giftcards/buy",
  //       permission: "all",
  //     },
  //     {
  //       text: "Sell",
  //       link: "/giftcards/sell",
  //       permission: "all",
  //     },
  //   ],
  // },
  {
    icon: "coins",
    text: "Wallet Transactions",
    permission: "transactions.view",
    // link: "/withdrawals",
    subMenu: [
      {
        text: "All",
        link: "/wallet/all",
        permission: "all",
      },
      {
        text: "Deposit",
        link: "/wallet/deposit",
        permission: "finance.view_deposits",
      },
      // {
      //   text: "Transfer",
      //   link: "/wallet/transfer",
      //   permission: "all",
      // },
      {
        text: "Withdrawal",
        link: "/wallet/withdrawal",
        permission: "finance.view_withdrawals",
      },
    ],
  },
  {
    icon: "swap",
    text: "Services Transactions",
    permission: "transactions.view",
    // link: "/transactions",
    subMenu: [
      {
        text: "All Transactions",
        link: "/transactions/all",
        permission: "all",
      },

      {
        text: "Airtime Transactions",
        link: "/transactions/airtime",
        permission: "all",
      },
      {
        text: "Data Transactions",
        link: "/transactions/data",
        permission: "all",
      },
      {
        text: "Betting Transactions",
        link: "/transactions/bettings",
        permission: "all",
      },

      {
        text: "Cable TV Transactions",
        link: "/transactions/cable-tv",
        permission: "all",
      },
      {
        text: "Electricity Transactions",
        link: "/transactions/electricity",
        permission: "all",
      },
      {
        text: "Education",
        link: "/transactions/education",
        permission: "all",
      },

      // {
      //   text: "Services Transactions",
      //   link: "/transactions/services",
      //   permission: "all",
      // },
    ],
  },

  // {
  //   icon: "invest",
  //   text: "Requests",
  //   permission: "all",
  //   link: "/withdrawals",
  //   subMenu: [
  //     {
  //       text: "Deposit Requests",
  //       link: "/requests/deposit",
  //       permission: "all",
  //     },
  //     {
  //       text: "Withdrawal Requests",
  //       link: "/requests/withdrawal",
  //       permission: "all",
  //     },
  //   ],
  // },

  {
    heading: "Manage Users",
    show: "all",
    // show: ["users", "admins", "roles"],
  },
  {
    icon: "users-fill",
    text: "Users",
    link: "/user-management",
    permission: "users.view",
  },
  {
    icon: "user-alt-fill",
    text: "Admin",
    link: "/admin-management",
    permission: "admin.view",
  },
  {
    icon: "layers-fill",
    text: "Roles",
    link: "/roles-management",
    permission: "roles.view",
  },
  // {
  //   icon: "user-list-fill",
  //   text: "Referrals",
  //   link: "/referral-management",
  //   permission: "all",
  // },

  {
    heading: "New & updates",
    show: "all",
    // show: ["alerts", "announcement", "faqs", "referral-terms", "all"],
  },
  {
    icon: "inbox-fill",
    text: "Announcement",
    link: "/announcement",
    permission: "alerts.view",
  },
  {
    icon: "view-x7",
    text: "Banners",
    link: "/banners",
    permission: "banners.view",
  },
  {
    icon: "question",
    text: "FAQ",
    permission: "faqs.view",
    subMenu: [
      {
        text: "FAQ Categories",
        link: "/faq-categories",
        permission: "faqs_categories.view",
      },
      {
        text: "FAQs",
        link: "/faqs",
        permission: "faqs.view",
      },
    ],
  },
  // {
  //   icon: "mobile",
  //   text: "App Version",
  //   link: "/app-version",
  //   permission: "all",
  // },

  {
    icon: "notes",
    text: "Referral Terms",
    link: "/referral-terms",
    permission: "all",
  },

  {
    heading: "configuration",
    show: "all",
    // show: ["providers", "services", "route-actions"],
  },
  // {
  //   icon: "cc-jcb",
  //   text: "Giftcard Management",
  //   permission: "all",
  //   subMenu: [
  //     {
  //       text: "Categories",
  //       link: "/giftcard-categories",
  //       permission: "all",
  //     },
  //     {
  //       text: "Products",
  //       link: "/giftcard-products",
  //       permission: "all",
  //     },
  //   ],
  // },
  // {
  //   icon: "sign-btc-alt",
  //   text: "Crypto",
  //   permission: "all",
  //   subMenu: [
  //     {
  //       text: "Networks",
  //       link: "/crypto-networks",
  //       permission: "all",
  //     },
  //     {
  //       text: "Assets",
  //       link: "/crypto-assets",
  //       permission: "all",
  //     },
  //     // {
  //     //   text: "Currencies",
  //     //   link: "/crypto-currencies",
  //     //   permission: "manage_currencies",
  //     // },
  //   ],
  // },
  // {
  //   icon: "wallet",
  //   text: "System bank account",
  //   link: "/system-bank-account",
  //   permission: "all",
  // },
  {
    icon: "rss",
    text: "Service Providers",
    link: "/service-providers",
    permission: "system.manage_providers",
  },
  {
    icon: "shield-star-fill",
    text: "Service Types",
    link: "/service-types",
    permission: "system.manage_services",
  },
  {
    icon: "network",
    text: "Services",
    link: "/services",
    permission: "system.manage_services",
  },
  // {
  //   icon: "bag",
  //   text: "Manual Products",
  //   link: "/manual-products",
  //   permission: "services",
  // },
  // {
  //   icon: "shield-star-fill",
  //   text: "Restricted Entities",
  //   link: "/restricted-entities",
  //   permission: "all",
  // },

  {
    heading: "preferences",
    show: ["all"],
  },
  // {
  //   icon: "account-setting",
  //   text: "Account",
  //   link: "/account settings",
  // },
  {
    icon: "opt-alt-fill",
    text: "Settings",
    link: "/settings",
    permission: "system.view_settings",
  },
];
export default menu;
