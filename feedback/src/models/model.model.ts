import mongoose from "mongoose";
import modelSchema from "../schemas/model.schema";

const SnakeModel = mongoose.model("SnakeModel", modelSchema, "snake_models");

export default SnakeModel;