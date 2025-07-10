import { configDotenv } from "dotenv";
import SnakeModel from "../models/model.model";
import { ModelData } from "../core/interfaces/data";

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

    async saveModel(modelId: string, model: ModelData) {
        const masterModel = await this.getMasterModel();
        if (!masterModel) {
            const newModel = new SnakeModel({
                id: "snake-genesys",
                learningRate: model.learningRate,
                discountFactor: model.discountFactor,
                highScore: model.highScore,
                highEpisode: model.highEpisode,
                livingStreak: model.livingStreak || 0, // Ensure livingStreak is set, default to 0 if not provided
                deathCount: model.deathCount || 0, // Ensure deathCount is set, default to 0 if not provided
                data: model.q ? JSON.stringify(model.q) : "{}",
            });

            const saveModel = await newModel.save();
            return saveModel;
        }

        // check if the score and episode are higher than the master model
        if ((model.highScore > masterModel.highScore && model.livingStreak > masterModel.livingStreak) || (model.highScore === masterModel.highScore && model.highEpisode > masterModel.highEpisode)) {
            masterModel.highScore = model.highScore;
            masterModel.highEpisode = model.highEpisode || 0; // Ensure highEpisode is set, default to 0 if not provided
            masterModel.livingStreak = model.livingStreak || 0; // Ensure living Streak is set, default to 0 if not provided
            masterModel.deathCount = model.deathCount || 0; // Ensure deathCount is set, default to 0 if not provided
            masterModel.learningRate = model.learningRate;
            masterModel.discountFactor = model.discountFactor;
            masterModel.data = model.q ? JSON.stringify(model.q) : "{}";

            const updatedModel = await masterModel.save();
            return updatedModel;
        } else {
            // check if the model already exists then update it
            const existingModel = await SnakeModel.findOne({ id: modelId });
            if (existingModel) {
                existingModel.learningRate = model.learningRate;
                existingModel.discountFactor = model.discountFactor;
                existingModel.highScore = model.highScore;
                existingModel.highEpisode = model.highEpisode || 0; // Ensure highEpisode is set, default to 0 if not provided
                existingModel.livingStreak = model.livingStreak || 0; // Ensure livingStreak is set, default to 0 if not provided
                existingModel.deathCount = model.deathCount || 0; // Ensure deathCount
                existingModel.data = model.q ? JSON.stringify(model.q) : "{}";

                const updatedModel = await existingModel.save();
                return updatedModel;
            }

            const newModel = new SnakeModel({
                id: modelId,
                learningRate: model.learningRate,
                discountFactor: model.discountFactor,
                highScore: model.highScore,
                highEpisode: model.highEpisode,
                livingStreak: model.livingStreak || 0, // Ensure livingStreak is set, default to 0 if not provided
                deathCount: model.deathCount || 0, // Ensure deathCount is set,
                data: model.q ? JSON.stringify(model.q) : "{}",
            });

            const savedModel = await newModel.save();
            return savedModel;
        }
    }
}

const modelService = new ModelService();

export default modelService;