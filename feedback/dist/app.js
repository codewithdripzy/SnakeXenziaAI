"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const server_1 = __importDefault(require("./server"));
// initialize enviromental variable configuration
dotenv_1.default.config();
// instanciate server class
const PORT = Number((_a = process.env.PORT) !== null && _a !== void 0 ? _a : "");
const server = new server_1.default({ PORT });
// call the listen method in the server class
server.listen();
