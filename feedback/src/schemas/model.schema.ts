import { Schema } from "mongoose";

const modelSchema = new Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },

});

export default modelSchema;