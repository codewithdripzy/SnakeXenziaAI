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
const dotenv_1 = __importDefault(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
class Database {
    constructor() {
        var _a, _b, _c, _d, _e;
        dotenv_1.default.config();
        this.host = (_a = process.env.DB_HOST) !== null && _a !== void 0 ? _a : '';
        this.port = (_b = process.env.DB_PORT) !== null && _b !== void 0 ? _b : '';
        this.user = (_c = process.env.DB_USER) !== null && _c !== void 0 ? _c : '';
        this.password = (_d = process.env.DB_PASSWORD) !== null && _d !== void 0 ? _d : '';
        this.dbName = (_e = process.env.DB_NAME) !== null && _e !== void 0 ? _e : '';
    }
    getConnection() {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return yield mongoose_1.default.connect(`mongodb+srv://${this.user}:${this.password}@${this.host}/${this.dbName}?retryWrites=true&w=majority&appName=snake-xenzia`, { serverApi: { version: '1', strict: true, deprecationErrors: true } }).then(() => console.log('Connected to the database'));
            }
            catch (error) {
                console.error('Failed to connect to the database:', error);
                throw error;
            }
        });
    }
}
exports.default = Database;
