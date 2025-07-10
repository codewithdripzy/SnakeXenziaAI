import { Router } from "express";
import { GetBranchModel, GetMasterModel, SaveBranchModel } from "../controllers/model.controller";
import { model } from "mongoose";

const modelRouter = Router();

modelRouter.route("/master").get(GetMasterModel);
modelRouter.route("/:branchId").get(GetBranchModel);

// for saving result trained from the master model
modelRouter.route("/save/master").post(SaveBranchModel);
modelRouter.route("/save/:branchId").post(SaveBranchModel);

export default modelRouter;