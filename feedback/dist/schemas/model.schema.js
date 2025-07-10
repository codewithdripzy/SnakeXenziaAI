"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const modelSchema = new mongoose_1.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    highScore: {
        type: Number,
        default: 0
    },
    highEpisode: {
        type: Number,
        default: 0
    },
    livingStreak: {
        type: Number,
        default: 0
    },
    deathCount: {
        type: Number,
        default: 0
    },
    learningRate: {
        type: Number,
        default: 0.5
    },
    discountFactor: {
        type: Number,
        default: 0.9
    },
    data: {
        type: String,
        required: true
    }
}, { timestamps: true });
exports.default = modelSchema;
