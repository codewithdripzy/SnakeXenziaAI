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
const http_1 = __importDefault(require("http"));
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const model_routes_1 = __importDefault(require("./router/model.routes"));
const database_1 = __importDefault(require("./config/database"));
const socket_io_1 = require("socket.io");
const default_controller_1 = require("./controllers/default.controller");
class AmiraServer {
    constructor({ PORT }) {
        var _a;
        this.port = PORT;
        this.app = (0, express_1.default)();
        this.server = http_1.default.createServer(this.app);
        this.io = new socket_io_1.Server(this.server, {
            cors: {
                origin: ((_a = process.env.ALLOWED_ORIGINS) === null || _a === void 0 ? void 0 : _a.split(",")) || "*",
                methods: ['GET', 'POST']
            }
        });
        this.db = null;
        this.setup();
        this.connect();
        this.route();
    }
    setup() {
        var _a;
        this.app.use((0, cors_1.default)({
            origin: ((_a = process.env.ALLOWED_ORIGINS) === null || _a === void 0 ? void 0 : _a.split(",")) || "*",
        }));
        this.app.use(express_1.default.json());
        this.app.use(express_1.default.urlencoded({ extended: true }));
    }
    connect() {
        return __awaiter(this, void 0, void 0, function* () {
            const database = new database_1.default();
            yield database.getConnection();
            // this.io.on("connection", (socket) => {
            //     console.log("User connected to Assitant");
            //     socket.on("transcript", async (message) => {
            //         console.log(message);
            //     });
            //     socket.on("disconnect", () => {
            //         console.log("User disconnected");
            //     });
            // });
        });
    }
    route() {
        this.app.use("/api/v:version", default_controller_1.verifyAPI);
        this.app.use("/api/v:version/model", model_routes_1.default);
        this.app.use("/api/v:version", default_controller_1.noRouteFound);
    }
    listen() {
        this.server.listen(this.port, () => console.log(`Server running on port ${this.port}`));
    }
}
exports.default = AmiraServer;
