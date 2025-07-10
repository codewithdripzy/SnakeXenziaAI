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
const dotenv_1 = require("dotenv");
const model_model_1 = __importDefault(require("../models/model.model"));
class ModelService {
    constructor() {
        (0, dotenv_1.configDotenv)();
        this.masterModelId = process.env.MASTER_MODEL_ID || "snake-genesys";
    }
    getMasterModel() {
        return __awaiter(this, void 0, void 0, function* () {
            const masterModel = yield model_model_1.default.findOne({
                id: this.masterModelId,
            });
            return masterModel;
        });
    }
    getBranchModel(branchId) {
        return __awaiter(this, void 0, void 0, function* () {
            const branchModel = yield model_model_1.default.findOne({
                id: branchId,
            });
            return branchModel;
        });
    }
    saveModel(modelId, model) {
        return __awaiter(this, void 0, void 0, function* () {
            const masterModel = yield this.getMasterModel();
            if (!masterModel) {
                const newModel = new model_model_1.default({
                    id: "snake-genesys",
                    learningRate: model.learningRate,
                    discountFactor: model.discountFactor,
                    highScore: model.highScore,
                    highEpisode: model.highEpisode,
                    livingStreak: model.livingStreak || 0, // Ensure livingStreak is set, default to 0 if not provided
                    deathCount: model.deathCount || 0, // Ensure deathCount is set, default to 0 if not provided
                    data: model.q ? JSON.stringify(model.q) : "{}",
                });
                const saveModel = yield newModel.save();
                return saveModel;
            }
            // check if the score and episode are higher than the master model
            if ((model.highScore >= masterModel.highScore && model.livingStreak >= masterModel.livingStreak) || (model.highScore === masterModel.highScore && model.highEpisode > masterModel.highEpisode)) {
                masterModel.highScore = model.highScore;
                masterModel.highEpisode = model.highEpisode || 0; // Ensure highEpisode is set, default to 0 if not provided
                masterModel.livingStreak = model.livingStreak || 0; // Ensure living Streak is set, default to 0 if not provided
                masterModel.deathCount = model.deathCount || 0; // Ensure deathCount is set, default to 0 if not provided
                masterModel.learningRate = model.learningRate;
                masterModel.discountFactor = model.discountFactor;
                masterModel.data = model.q ? JSON.stringify(model.q) : "{}";
                const updatedModel = yield masterModel.save();
                return updatedModel;
            }
            else {
                // check if the model already exists then update it
                const existingModel = yield model_model_1.default.findOne({ id: modelId });
                if (existingModel) {
                    existingModel.learningRate = model.learningRate;
                    existingModel.discountFactor = model.discountFactor;
                    existingModel.highScore = model.highScore;
                    existingModel.highEpisode = model.highEpisode || 0; // Ensure highEpisode is set, default to 0 if not provided
                    existingModel.livingStreak = model.livingStreak || 0; // Ensure livingStreak is set, default to 0 if not provided
                    existingModel.deathCount = model.deathCount || 0; // Ensure deathCount
                    existingModel.data = model.q ? JSON.stringify(model.q) : "{}";
                    const updatedModel = yield existingModel.save();
                    return updatedModel;
                }
                const newModel = new model_model_1.default({
                    id: modelId,
                    learningRate: model.learningRate,
                    discountFactor: model.discountFactor,
                    highScore: model.highScore,
                    highEpisode: model.highEpisode,
                    livingStreak: model.livingStreak || 0, // Ensure livingStreak is set, default to 0 if not provided
                    deathCount: model.deathCount || 0, // Ensure deathCount is set,
                    data: model.q ? JSON.stringify(model.q) : "{}",
                });
                const savedModel = yield newModel.save();
                return savedModel;
            }
        });
    }
}
const modelService = new ModelService();
exports.default = modelService;
