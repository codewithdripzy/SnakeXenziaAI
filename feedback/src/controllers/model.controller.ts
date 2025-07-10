import { Request, Response } from "express";
import modelService from "../services/model.service";
import { saveModelValidator } from "../validators/model.dto";
import { ModelStruct } from "../core/interfaces/data";
import { configDotenv } from "dotenv";

configDotenv();
const masterModelId = process.env.MASTER_MODEL_ID || "";
const masterModelWritePassword = process.env.MASTER_MODEL_WRITE_PASSWORD || "";

const GetMasterModel = async (req: Request, res: Response) => {
    try {
        const masterModel = await modelService.getMasterModel();
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
    } catch (error) {
        res.status(500).json({
            message: "Unable to retrieve model from master mode, Try again later",
            error: error instanceof Error ? error.message : "Unknown error",
        });
        return;
    }
}

const GetBranchModel = async (req: Request, res: Response) => {
    try {
        const branchId = req.params.branchId;
        if (!branchId) {
            res.status(400).json({
                message: "Branch ID is required",
            });
            return;
        }

        const branchModel = await modelService.getBranchModel(branchId);
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
    } catch (error) {
        res.status(500).json({
            message: "Unable to retrieve model from branch mode, Try again later",
        });
        return;
    }
}

const SaveBranchModel = (req: Request, res: Response) => {
    try {
        const { error } = saveModelValidator.validate(req.body);
        
        if (error) {
            res.status(400).json({
                message: "Invalid request data",
                error: error.details[0].message,
            });
            return;
        }

        const { modelId, model } : ModelStruct = req.body;

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
        const savedModel = modelService.saveModel(modelId, model);
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
    } catch (error) {
        res.status(500).json({
            message: "Unable to save model to branch mode, Try again later",
            error: error instanceof Error ? error.message : "Unknown error",
        });
        return;
    }
}

export { GetMasterModel, GetBranchModel, SaveBranchModel };