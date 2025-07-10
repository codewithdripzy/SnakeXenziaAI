"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SaveBranchModel = exports.GetBranchModel = exports.GetMasterModel = void 0;
const model_service_1 = __importDefault(require("../services/model.service"));
const model_dto_1 = require("../validators/model.dto");
const dotenv_1 = require("dotenv");
(0, dotenv_1.configDotenv)();
const masterModelId = process.env.MASTER_MODEL_ID || "";
const masterModelWritePassword = process.env.MASTER_MODEL_WRITE_PASSWORD || "";
const GetMasterModel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const masterModel = yield model_service_1.default.getMasterModel();
        if (!masterModel) {
            res.status(404).json({
                message: "Master model not found",
            });
            return;
        }
        res.status(200).json({
            message: "Master model retrieved successfully",
            data: masterModel,
        });
        return;
    }
    catch (error) {
        res.status(500).json({
            message: "Unable to retrieve model from master mode, Try again later",
            error: error instanceof Error ? error.message : "Unknown error",
        });
        return;
    }
});
exports.GetMasterModel = GetMasterModel;
const GetBranchModel = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const branchId = req.params.branchId;
        if (!branchId) {
            res.status(400).json({
                message: "Branch ID is required",
            });
            return;
        }
        const branchModel = yield model_service_1.default.getBranchModel(branchId);
        if (!branchModel) {
            res.status(404).json({
                message: "Branch model not found",
            });
            return;
        }
        res.status(200).json({
            message: "Branch model retrieved successfully",
            data: branchModel,
        });
        return;
    }
    catch (error) {
        res.status(500).json({
            message: "Unable to retrieve model from branch mode, Try again later",
        });
        return;
    }
});
exports.GetBranchModel = GetBranchModel;
const SaveBranchModel = (req, res) => {
    try {
        const { error } = model_dto_1.saveModelValidator.validate(req.body);
        if (error) {
            res.status(400).json({
                message: "Invalid request data",
                error: error.details[0].message,
            });
            return;
        }
        const { modelId, model } = req.body;
        // check if the modelId is the master model ID
        // if(modelId == masterModelId) {
        //     const authData = req.headers.authorization;
        //     if(!authData || !authData.startsWith("Basic ")) {
        //         res.status(403).json({
        //             message: "Access denied: Master model write password is required",
        //         });
        //         return;
        //     }
        //     const password = authData.split(" ")[1];
        //     // check if the write password is correct
        //     if(password !== btoa(masterModelWritePassword)) {
        //         res.status(403).json({
        //             message: "Access denied: Invalid write password for master model",
        //         });
        //         return;
        //     }
        // }
        // save the model to the database
        const savedModel = model_service_1.default.saveModel(modelId, model);
        if (!savedModel) {
            res.status(500).json({
                message: "Unable to save model to database, Try again later",
            });
            return;
        }
        res.status(201).json({
            message: "Model saved successfully to branch mode",
        });
        return;
    }
    catch (error) {
        res.status(500).json({
            message: "Unable to save model to branch mode, Try again later",
            error: error instanceof Error ? error.message : "Unknown error",
        });
        return;
    }
};
exports.SaveBranchModel = SaveBranchModel;
