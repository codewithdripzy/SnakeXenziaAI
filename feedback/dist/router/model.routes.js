"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const model_controller_1 = require("../controllers/model.controller");
const modelRouter = (0, express_1.Router)();
modelRouter.route("/master").get(model_controller_1.GetMasterModel);
modelRouter.route("/:branchId").get(model_controller_1.GetBranchModel);
// for saving result trained from the master model
modelRouter.route("/save/master").post(model_controller_1.SaveBranchModel);
modelRouter.route("/save/:branchId").post(model_controller_1.SaveBranchModel);
exports.default = modelRouter;
