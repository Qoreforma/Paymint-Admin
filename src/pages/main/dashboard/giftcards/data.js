export const giftcardFilterOptions = [
  {
    name: "status",
    options: [
      { value: "", label: "All" },
      { value: "pending", label: "Pending" },
      { value: "approved", label: "Approved" },
      { value: "s.approved", label: "Sec. Approved" },
      { value: "multiple", label: "Multiple" },
      { value: "declined", label: "Declined" },
    ],
  },
];

export const giftcardErrorPrompts = [
  {
    title: "REPEATED",
    description: "This giftcard has been sent earlier and is already under processing. Please be patient.",
  },
  {
    title: "ALREADY APPROVED",
    description: "The gift card attached has already been approved for you. Please review your trading history.",
  },
  {
    title: "ALREADY REDEEMED",
    description:
      "The asset you submitted has already been used/redeemed before you uploaded it on the platform. Kindly check with your source.",
  },
  {
    title: "ERROR CARD",
    description: "Unable to query this card. Kindly report back to the store of purchase to have this rectified.",
  },
  {
    title: "UNABLE TO VIEW",
    description:
      "The image you uploaded could not be viewed. Kindly attach better quality images of your gift card in another trade. If you are experiencing issues uploading the image of your asset, kindly reach out to us via WhatsApp or call our support line.",
  },
  { title: "INVALID CODE", description: "The code provided is invalid, kindly send the correct code in a new trade." },
  {
    title: "EMPTY TRADE",
    description: "There is no gift card attached to this trade. Please attach an image of the asset in a new trade.",
  },
  {
    title: "FRONT AND BACK REQUIRED",
    description:
      "The trade you are trying to upload requires front and back images of the gift card to be processed. Kindly attach the front and back images of your gift card in a new trade.",
  },
  {
    title: "BAD TRADE",
    description:
      "The asset you uploaded is a common bad card and has been rejected multiple times. Please be informed that consistently trading bad cards could result in a ban being placed on your account.",
  },
  {
    title: "NOT CLEAR",
    description:
      "Your gift card picture is not clear enough. Kindly type in the correct code in 'comments' field in a new trade AND upload a clearer picture.",
  },
  { title: "GIFTCARD LOCKED", description: "Kindly report back to the store of purchase for further assistance." },
  {
    title: "NOT ACTIVATED",
    description:
      "The asset you uploaded was not properly activated in the store of purchase. Kindly return it to store for proper activation.",
  },
  {
    title: "ALREADY REJECTED",
    description: "The gift card attached has been rejected earlier for you. Please review your trading history.",
  },
  {
    title: "ZOMBIE",
    description:
      "The balance in the code you uploaded cannot be deducted. Kindly reach out to your source to have this rectified.",
  },
  {
    title: "NO OFFER",
    description: "Unfortunately, we do not have offers for your transaction at the moment. Please check back later.",
  },
  {
    title: "ERROR",
    description: "The asset you uploaded gave an error. Please check the screenshot attached for proof of the error.",
  },
  {
    title: "GOOGLE ERROR",
    description:
      "The asset you uploaded requires more information to be redeemed. This is an error associated with googleplay cards. The balance is still intact but cannot be accessed until the issue is resolved. Kindly take the card back to the store of purchase to have this rectified or contact google support. For more information about this, visit, https://support.google.com/googleplay/answer/9281737",
  },
  {
    title: "GIFTCARD DEACTIVATED",
    description:
      "The code you uploaded has been deactivated. Please reach out to the store of purchase for further assistance.",
  },
  {
    title: "INVALID",
    description:
      "The image you attached does not correspond with the selected trade. Kindly unbox your gift card or peel off silver panel to reveal all the codes for redemption.",
  },
  {
    title: "EXPOSED ASSET",
    description:
      "Please be informed that this asset has been processed earlier for another user. Please do not resend.",
  },
  {
    title: "INCOMPLETE CODES",
    description: "Kindly capture the edge to edge image of your gift card and attach in a new trade.",
  },
  {
    title: "EMPTY BALANCE",
    description: "There is no balance in the code/card you uploaded. Please check with your source.",
  },
  {
    title: "ON HOLD",
    description:
      "The status of your asset shows 'ON HOLD'. This means that the giftcard is inactive(locked) and we are unable to utilize it. Kindly report to the store of purchase for rectification.",
  },
  {
    title: "XBOX LIVE",
    description: "Unfortunately, we do not have offers for xbox live/subscription cards. Please do not resend.",
  },
  {
    title: "GIFT CARD DISABLED",
    description: "Kindly reach out to your source or the store of purchase to have this rectified.",
  },
  {
    title: "BADLY SCRATCHED",
    description:
      "Please note that this asset is badly scratched hence, the claim code is incomplete. Please scratch your cards carefully next time.",
  },
  {
    title: "CODE GUESS",
    description:
      "Dear user, please note that we do not allow guessing of codes on our platform. If you have an image, please upload it as your account may be suspended after 10 unsuccessful attempts.",
  },
  {
    title: "PHYSICAL IMAGE REQUIRED",
    description:
      "Dear user, we need the full image of your gift card to process this transaction under the physical category. In the absence of a physical card, kindly re-upload this transaction under the E-code category.",
  },
  {
    title: "REGISTERED CARD",
    description:
      "Dear user, please note that we do not accept gift cards that have previously been registered to another account. Please reach out to your source for further investigation.",
  },
];
