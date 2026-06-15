import axios from "axios";
import prisma from "../prisma";

// let ebayAccessToken: String | null = null;
// let tokenExpiry: number | null = null;

const generateEbayToken = async () => {
  const data = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token:
      "v^1.1#i^1#r^1#f^0#p^3#I^3#t^Ul4xMF84OjQzRkUxREFBNDI4MUFEQjhFQjRFNDJDQzJENzc3RjAyXzFfMSNFXjI2MA==",
    scope:
      "https://api.ebay.com/oauth/api_scope https://api.ebay.com/oauth/api_scope/sell.marketing.readonly https://api.ebay.com/oauth/api_scope/sell.marketing https://api.ebay.com/oauth/api_scope/sell.inventory.readonly https://api.ebay.com/oauth/api_scope/sell.inventory https://api.ebay.com/oauth/api_scope/sell.account.readonly https://api.ebay.com/oauth/api_scope/sell.account https://api.ebay.com/oauth/api_scope/sell.fulfillment.readonly https://api.ebay.com/oauth/api_scope/sell.fulfillment https://api.ebay.com/oauth/api_scope/sell.analytics.readonly https://api.ebay.com/oauth/api_scope/sell.finances https://api.ebay.com/oauth/api_scope/sell.payment.dispute https://api.ebay.com/oauth/api_scope/commerce.identity.readonly https://api.ebay.com/oauth/api_scope/sell.reputation https://api.ebay.com/oauth/api_scope/sell.reputation.readonly https://api.ebay.com/oauth/api_scope/commerce.notification.subscription https://api.ebay.com/oauth/api_scope/commerce.notification.subscription.readonly https://api.ebay.com/oauth/api_scope/sell.stores https://api.ebay.com/oauth/api_scope/sell.stores.readonly https://api.ebay.com/oauth/scope/sell.edelivery",
  });

  const response = await axios.post(
    "https://api.ebay.com/identity/v1/oauth2/token",
    data,
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Authorization:
          "Basic Uml0ZXNoU3UtQXV0b2Ryb3AtUFJELTVhNzBlN2Q4Ni0yZTYyNTRlNTpQUkQtYTcwZTdkODY0OTg0LTBjY2ItNDM2ZS1hNTVhLTk1MzI=",
      },
    }
  );
  if (response) {
    const token = response?.data?.access_token;

    const expiresIn = response.data.expires_in * 1000;

    await prisma.token.upsert({
      where: { id: 1 },
      update: {
        accessToken: token,
        expiresAt: new Date(Date.now() + expiresIn - 60000), // 1 min buffer
      },
      create: {
        id: 1,
        name: "ebayToken",
        accessToken: token,
        expiresAt: new Date(Date.now() + expiresIn - 60000),
      },
    });

    return token;
  }
};

// generateEbayToken();

// setInterval(generateEbayToken, 90 * 60 * 1000);

// export const getEbayAccessToken = async (): Promise<String> => {
//   if (!ebayAccessToken || !tokenExpiry || Date.now() > tokenExpiry) {
//     await generateEbayToken();
//     console.log(tokenExpiry, "token (after refresh)");
//   }
//   return ebayAccessToken!;
// };

export const getEbayAccessToken = async () => {
  const dbToken = await prisma.token.findUnique({ where: { id: 1 } });
  // console.log(dbToken);

  if (!dbToken || !dbToken.expiresAt) {
    // No token found in DB or no expiry date stored, so generate a new token
    return await generateEbayToken();
  }

  const expiresAt = new Date(dbToken?.expiresAt).getTime();
  const now = new Date().getTime();
  // const buffer = 60 * 1000; // never used

  if (now >= expiresAt) {
    return await generateEbayToken();
  }

  return dbToken.accessToken;
};
