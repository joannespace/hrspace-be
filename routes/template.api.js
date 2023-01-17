const express = require("express");
const templateController = require("../controllers/template.controller");
const authentication = require("../middlewares/authentication");
const validators = require("../middlewares/validators");
const router = express.Router();
const config = require("../config/config");

/**
 * @route POST /templates
 * @description Create new template
 * @header {accessToken}
 * @access Login Required, Admin Only
 */
router.post(
  "/",
  validators.validate(config.templateValidationReq),
  authentication.loginRequired,
  authentication.adminOnly,
  templateController.createNewTemplate
);

/**
 * @route GET /templates
 * @description Get Template List
 * @header {accessToken}
 * @access Login Required
 */
router.get(
  "/",
  authentication.loginRequired,
  templateController.getTemplateList
);

/**
 * @route GET /templates/:templateId
 * @description Get Single Template
 * @header {accessToken}
 * @access Login Required
 */
router.get(
  "/:templateId",
  authentication.loginRequired,
  templateController.getSingleTemplate
);

/**
 * @route PUT /template/:templateId
 * @description Update a template
 * @header {accessToken}
 * @access Login Required, Admin Only
 */
router.put(
  "/:templateId",
  validators.validate(config.templateValidationReq),
  authentication.loginRequired,
  authentication.adminOnly,
  templateController.updateTemplate
);

/**
 * @route DELETE /templates/:templateId
 * @description Delete a template
 * @header {accessToken}
 * @access Login Required, Admin Only
 */
router.delete(
  "/:templateId",
  authentication.loginRequired,
  authentication.adminOnly,
  templateController.deleteTemplate
);

module.exports = router;
