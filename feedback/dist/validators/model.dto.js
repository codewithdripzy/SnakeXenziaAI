"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveModelValidator = void 0;
const joi_1 = __importDefault(require("joi"));
const saveModelValidator = joi_1.default.object({
    modelId: joi_1.default.string().required(),
    model: joi_1.default.object({
        highScore: joi_1.default.number().optional(),
        highEpisode: joi_1.default.number().required(),
        livingStreak: joi_1.default.number().required(),
        deathCount: joi_1.default.number().required(),
        learningRate: joi_1.default.number().required(),
        discountFactor: joi_1.default.number().required(),
        q: joi_1.default.object().pattern(joi_1.default.string(), joi_1.default.array().items(joi_1.default.number())),
    }).required(),
});
exports.saveModelValidator = saveModelValidator;
