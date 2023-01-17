const express = require("express");
const router = express.Router();
const authentication = require("../middlewares/authentication");
const validators = require("../middlewares/validators");
const config = require("../config/config");
const reviewController = require("../controllers/review.controller");

/**
 * @route POST /reviews/:id
 * @description Create a review
 * @header {accessToken}
 * @access Login Required, Admin Only
 */
router.post(
  "/:id",
  validators.validate(config.validateReviewReq),
  authentication.loginRequired,
  authentication.adminOnly,
  reviewController.createReview
);

/**
 * @route GET /reviews/:id?page=0&limit=10
 * @description Get review list of a specific employee
 * @header {accessToken}
 * @access Login Required
 */
router.get(
  "/:id",
  authentication.loginRequired,
  reviewController.getReviewList
);

/**
 * @route GET /reviews/:id/:reviewId
 * @description Get a review
 * @query {id, reviewId}
 * @header {accessToken}
 * @access Login Required
 */
router.get(
  "/:id/:reviewId",
  authentication.loginRequired,
  reviewController.getSingleReview
);

/**
 * @route PUT /reviews/:id/:reviewId
 * @description Update a review
 * @query {id, reviewId}
 * @header {accessToken}
 * @access Login Required, Admin and Manager
 */
router.put(
  "/:id/:reviewId",
  validators.validate(config.validateReviewReq),
  authentication.loginRequired,
  reviewController.updateReview
);

/**
 * @route POST /reviews/:id/:reviewId
 * @description Share a review
 * @query {id, reviewId}
 * @header {accessToken}
 * @access Login Required, Admin Only
 */
router.post(
  "/:id/:reviewId",
  authentication.loginRequired,
  authentication.adminOnly,
  reviewController.shareReview
);

/**
 * @route DELETE /reviews/:id/:reviewId
 * @description Delete a review
 * @params {id, reviewId }
 * @access Login Required, Admin Only
 */
router.delete(
  "/:id/:reviewId",
  authentication.loginRequired,
  authentication.adminOnly,
  reviewController.deleteReview
);

module.exports = router;
