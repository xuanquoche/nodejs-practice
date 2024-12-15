"use strict";

const express = require("express");
const productController = require("../../controllers/product.controller");
const router = express.Router();
const { asyncHandler } = require("../../auth/checkAuth");
const { authenticationV2 } = require("../../auth/authUtils");

router.get("/search/:keySearch", asyncHandler(productController.getListSearchProduct));

// authentication
router.use(authenticationV2);

// create product
router.post("", asyncHandler(productController.createProduct));

// update product
router.put("/publish/:id", asyncHandler(productController.publishProductByShop));
router.put("/unpublish/:id", asyncHandler(productController.unPublishProductByShop));

// query product
router.get("/drafts/all", asyncHandler(productController.getAllDraftsForShop));
router.get("/published/all", asyncHandler(productController.getAllPublishForShop));

module.exports = router;
