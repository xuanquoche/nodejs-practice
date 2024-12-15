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

  // QUERY PRODUCT
  /**
   * @description Query all drafts for shop 
   * @param {Number} limit 
   * @param {Number} skip 
   * @returns {JSON}
   */
  getAllDraftsForShop = async (req, res, next) => {
    new SuccessResponse({
      metadata: await ProductServiceV2.findAllDraftsForShop({product_shop: req.user.userId}),
      message: "Get all drafts for shop success",
    }).send(res);
  }

  getAllPublishForShop = async (req, res, next) => {
    new SuccessResponse({
      metadata: await ProductServiceV2.findAllPublishForShop({product_shop: req.user.userId}),
      message: "Get all published for shop success",
    }).send(res);
  }

  getListSearchProduct = async (req, res, next) => {
    new SuccessResponse({
      metadata: await ProductServiceV2.searchProducts(req.params),
      message: "Get list search product success",
    }).send(res);
  }

  //PUT
  publishProductByShop = async (req, res, next) => {
    new SuccessResponse({
      metadata: await ProductServiceV2.publishProductByShop({product_shop: req.user.userId, product_id: req.params.id}),
      message: "Publish product by shop success",
    }).send(res);
  }

  unPublishProductByShop = async (req, res, next) => {
    new SuccessResponse({
      metadata: await ProductServiceV2.unPublishProductByShop({product_shop: req.user.userId, product_id: req.params.id}),
      message: "Unpublish product by shop success",
    }).send(res);
  }

}

module.exports = new ProductController();
