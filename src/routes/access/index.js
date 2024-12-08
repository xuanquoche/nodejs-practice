"use strict";

const express = require("express");
const accessController = require("../../controllers/access.controller");
const router = express.Router();
const { asyncHandler } = require("../../auth/checkAuth");
const { authentication } = require("../../auth/authUtils");

// signUp
router.post("/shop/signup", asyncHandler(accessController.signUp));
router.post("/shop/login", asyncHandler(accessController.login));

// authentication
router.use(authentication);

////
router.post("/shop/logout", asyncHandler(accessController.logout));
router.post(
  "/shop/handlerRefreshToken",
  asyncHandler(accessController.handlerRefreshToken)
);

module.exports = router;
