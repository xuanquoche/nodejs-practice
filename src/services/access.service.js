"use strict";

const shopModel = require("../models/shop.model");
const bcrypt = require("bcrypt");
const crypto = require("node:crypto");
const KeyTokenService = require("./keyToken.service");
const { createTokenPair, verifyJWT } = require("../auth/authUtils");
const { getInfoData } = require("../utils");
const {
  BadRequestError,
  AuthFailureError,
  ForbiddenError,
} = require("../core/error.response");
const { findByEmail } = require("./shop.service");

const RoleShop = {
  SHOP: "SHOP",
  WRITER: "WRITER",
  EDITOR: "EDITOR",
  ADMIN: "ADMIN",
};

class AccessService {

  static handlerRefreshTokenV2 = async ({refreshToken, user, keyStore}) => {
    const {userId, email} = user;

    if(keyStore.refreshTokensUsed.includes(refreshToken)) {
      await KeyTokenService.deleteKeyById(userId);
      throw new ForbiddenError("something wrong happen !! pls re_login");
    }

    if(keyStore.refreshToken !== refreshToken) {
      throw new ForbiddenError("Shop not registered 0");
    }

    const foundShop = await findByEmail({ email });
    if (!foundShop) throw new AuthFailureError(" Shop not registered 2");

    // create 1 cặp token mới
    const tokens = await createTokenPair(
      { userId, email },
      keyStore.publicKey,
      keyStore.privateKey
    );

    //update token
    await keyStore.updateOne({
      $set: {
        refreshToken: tokens.refreshToken,
      },
      $addToSet: {
        refreshTokensUsed: refreshToken, // đã được sử dụng để lấy token mới rồi
      },
    });

    return {
      user,
      tokens,
    };   
  };
    
  static handlerRefreshToken = async (refreshToken) => {
    //check xem token đã đc sử dụng chưa
    const foundToken = await KeyTokenService.findByRefreshTokenUsed(
      refreshToken
    );
    // nếu có
    console.log("lol", foundToken);
    if (foundToken) {
      // decode xem mày là thằng nào ?
      const { userId, email } = await verifyJWT(
        refreshToken,
        foundToken.privateKey
      );
      // xóa tát cả token trong keystore
      await KeyTokenService.deleteKeyById();
      throw new ForbiddenError("something wrong happen !! pls re_login");
    }

    const holderToken = await KeyTokenService.findByRefreshToken(refreshToken);
    if (!holderToken) throw new AuthFailureError(" Shop not registered 1");

    // verify Token
    const { userId, email } = await verifyJWT(
      refreshToken,
      holderToken.privateKey
    );
    console.log("[2]--", { userId, email });

    //check userId
    const foundShop = await findByEmail({ email });
    if (!foundShop) throw new AuthFailureError(" Shop not registered 2");

    // create 1 cặp token mới
    const tokens = await createTokenPair(
      { userId, email },
      holderToken.publicKey,
      holderToken.privateKey
    );

    //update token
    await holderToken.updateOne({
      $set: {
        refreshToken: tokens.refreshToken,
      },
      $addToSet: {
        refreshTokensUsed: refreshToken, // đã được sử dụng để lấy token mới rồi
      },
    });

    return {
      user: { userId, email },
      tokens,
    };
  };

  static logout = async (keyStore) => {
    const delKey = await KeyTokenService.removeKeyById(keyStore._id);
    return delKey;
  };

  static login = async ({ email, password, refreshToken = null }) => {
    // step 1: check mail in db
    const foundShop = await findByEmail({ email });
    if (!foundShop) throw BadRequestError("Shop not registered");
    // step 2: match password
    const match = bcrypt.compare(password, foundShop.password);
    if (!match) throw new AuthFailureError("");
    // create privatekey, publickey
    const privateKey = crypto.randomBytes(64).toString("hex");
    const publicKey = crypto.randomBytes(64).toString("hex");
    // step 4 generate tokens
    const { _id: userId } = foundShop;
    const tokens = await createTokenPair(
      { userId, email },
      publicKey,
      privateKey
    );

    await KeyTokenService.createKeyToken({
      userId: foundShop._id,
      refreshToken: tokens.refreshToken,
      publicKey,
      privateKey,
    });

    return {
      shop: getInfoData({
        fields: ["_id", "name", "email"],
        object: foundShop,
      }),
      tokens,
    };
  };

  static signUp = async ({ name, email, password }) => {
    try {
      // step 1:check email exists
      const holderShop = await shopModel.findOne({ email });

      if (holderShop) {
        throw new BadRequestError("Error: Shop already registered");
      }

      const passwordHash = await bcrypt.hash(password, 10);

      const newShop = await shopModel.create({
        name,
        email,
        password: passwordHash,
        roles: [RoleShop.SHOP],
      });

      if (newShop) {
        // created privateKey, publicKey
        // const { privateKey, publicKey } = crypto.generateKeyPairSync("rsa", {
        //   modulusLength: 4096,
        //   publicKeyEncoding: {
        //     type: "pkcs1",
        //     format: "pem",
        //   },
        //   privateKeyEncoding: {
        //     type: "pkcs1",
        //     format: "pem",
        //   },
        // });

        const privateKey = crypto.randomBytes(64).toString("hex");
        const publicKey = crypto.randomBytes(64).toString("hex");

        const keyStore = await KeyTokenService.createKeyToken({
          userId: newShop._id,
          publicKey,
          privateKey,
        });

        if (!keyStore) {
          return {
            code: "xxxx",
            message: "public key error",
          };
        }

        // const publicKeyObject = crypto.createPublicKey(publicKey);
        console.log({ publicKey, privateKey });

        //created token pair
        const tokens = await createTokenPair(
          { userId: newShop._id, email },
          publicKey,
          privateKey
        );
        console.log(`Created token success::`, tokens);

        return {
          code: 201,
          metadata: {
            shop: getInfoData({
              fields: ["_id", "name", "email"],
              object: newShop,
            }),
            tokens,
          },
        };
      }

      return {
        code: 200,
        metadata: null,
      };
    } catch (error) {
      return {
        code: "xxx",
        message: error.message,
        status: "error",
      };
    }
  };
}

module.exports = AccessService;
