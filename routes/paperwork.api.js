const express = require("express");
const router = express.Router();
const paperworkController = require("../controllers/paperwork.controller");
const authentication = require("../middlewares/authentication");
const validators = require("../middlewares/validators");
const config = require("../config/config");

/**
 * @route GET /paperwork/:id (EmployeeID)
 * @description Get paperwork list of a specific employee
 * @header {accessToken}
 * @access Login Required
 */
router.get(
  "/:id",
  authentication.loginRequired,
  paperworkController.getPaperworkList
);

/**
 * @route GET /paperwork/:id/:idPaper
 * @description Get a paperwork details
 * @header {accessToken}
 * @access Login Required, Admin and Current EmployeeID Only
 */
router.get(
  "/:id/:idPaper",
  authentication.loginRequired,
  paperworkController.getSinglePaperwork
);

/**
 * @route POST /paperwork/:id
 * @description Create a paperwork
 * @header {accessToken}
 * @access Login Required, Admin Only
 */
router.post(
  "/:id",
  validators.validate(config.validateCreatePaperReq),
  authentication.loginRequired,
  authentication.adminOnly,
  paperworkController.createPaperwork
);

/**
 * @route PUT /paperwork/:id/:idPaper
 * @description Update a paperwork
 * @header {accessToken}
 * @access Login Required, Admin Only
 */
router.put(
  "/:id/:idPaper",
  validators.validate(config.validateCreatePaperReq),
  authentication.loginRequired,
  authentication.adminOnly,
  paperworkController.updatePaperwork
);

/**
 * @route DELETE /paperwork/:id/:idPaper
 * @description Delete a paperwork
 * @header {accessToken}
 * @access Login Required, Admin Only
 */
router.delete(
  "/:id/:idPaper",
  authentication.loginRequired,
  authentication.adminOnly,
  paperworkController.deletePaperwork
);

module.exports = router;
