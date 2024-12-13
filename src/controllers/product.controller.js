"use strict";

const { SuccessResponse } = require("../core/success.response");
const ProductService = require("../services/product.service");
const ProductServiceV2 = require("../services/product.service.xxx");

class ProductController {
  createProduct = async (req,res, next) => {
    new SuccessResponse({
        metadata: await ProductServiceV2.createProduct(req.body.product_type, {
          ...req.body,
          product_shop: req.user.userId
        }),
        message: "Create new product success",
      }).send(res);
  }

}

module.exports = new ProductController();
