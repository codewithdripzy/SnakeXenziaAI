import { Request, Response } from "express";
import modelService from "../services/model.service";

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

    } catch (error) {
        res.status(500).json({
            message: "Unable to retrieve model from branch mode, Try again later",
        });
        return;
    }
}

const SaveBranchModel = (req: Request, res: Response) => {
    try {
        const { branchId } = req.params;
        const modelData = req.body;

        if (!branchId || !modelData) {
            res.status(400).json({
                message: "Branch ID and model data are required",
            });
            return;
        }

        modelService.saveModel({
            id: branchId,
            ...modelData,
        });

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