"use string";

const JWT = require("jsonwebtoken");
const asyncHandler = require("../helpers/asyncHandler");
const { AuthFailureError, NotFoundError } = require("../core/error.response");
const { findByUserId } = require("../services/keyToken.service");

const HEADER = {
  API_KEY: "x-api-key",
  CLIENT_ID: "x-client-id",
  AUTHORIZATION: "authorization",
};

const createTokenPair = async (payload, publicKey, privateKey) => {
  try {
    // accessToken
    const accessToken = await JWT.sign(payload, privateKey, {
      // algorithm: "HS256",
      expiresIn: "2 days",
    });

    const refreshToken = await JWT.sign(payload, privateKey, {
      // algorithm: "HS256",
      expiresIn: "7 days",
    });

    //

    // JWT.verify(accessToken, publicKey, (err, decode) => {
    //   if (err) {
    //     console.error(`error verify::`, err);
    //   } else {
    //     console.log(`decode verify::`, decode);
    //   }
    // });

    return { accessToken, refreshToken };
  } catch (error) {}
};

const authentication = asyncHandler(async (req, res, next) => {
  /*
  1-check userId missing ??
  2-get access token
  3-verify token
  4-check user in dbs
  5-check keystore with this userid
  6-oke all => return next
  */

  const userId = req.headers[HEADER.CLIENT_ID];

  if (!userId) throw new AuthFailureError("Invalid request");

  //2
  const keyStore = await findByUserId(userId);
  if (!keyStore) throw new NotFoundError("Not Found keystore");
  console.log("keyStore", keyStore);

  // 3
  const accessToken = req.headers[HEADER.AUTHORIZATION];
  if (!accessToken) throw new AuthFailureError("Invalid request");

  try {
    const decodeUser = JWT.verify(accessToken, keyStore.privateKey);
    if (userId !== decodeUser.userId)
      throw new AuthFailureError("Invalid User");
    req.keyStore = keyStore;
    return next();
  } catch (error) {
    throw error;
  }
});

const verifyJWT = async (token, keySecret) => {
  return await JWT.verify(token, keySecret);
};

module.exports = {
  createTokenPair,
  authentication,
  verifyJWT,
};
