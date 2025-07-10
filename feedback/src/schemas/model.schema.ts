import { Schema } from "mongoose";

const modelSchema = new Schema({
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

export default modelSchema;