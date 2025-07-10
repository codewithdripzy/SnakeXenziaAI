"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const model_schema_1 = __importDefault(require("../schemas/model.schema"));
const SnakeModel = mongoose_1.default.model("SnakeModel", model_schema_1.default, "snake_models");
exports.default = SnakeModel;
