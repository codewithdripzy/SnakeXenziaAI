import { configDotenv } from "dotenv";
import SnakeModel from "../models/model.model";

class ModelService {
    masterModelId: string;

    constructor() {
        configDotenv();
        this.masterModelId = process.env.MASTER_MODEL_ID || "snake-genesys";
    }

    async getMasterModel() {
        const masterModel = await SnakeModel.findOne({
            id: this.masterModelId,
        });

        return masterModel;
    }

    async getBranchModel(branchId: string) {
        const branchModel = await SnakeModel.findOne({
            id: branchId,
        });

        return branchModel;
    }

    async saveModel(model: any) {
        const newModel = new SnakeModel(model);
        await newModel.save();
    }
}

const modelService = new ModelService();

export default modelService;