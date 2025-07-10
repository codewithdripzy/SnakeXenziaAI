import http from "http";
import cors from "cors";
import express from "express";
import { v4 as uuid } from "uuid";
import modelRouter from "./router/model.routes";
import Database from "./config/database";
import { Server } from "socket.io";
import { SXServerProps } from "./core/interfaces/props";
import { noRouteFound, verifyAPI } from "./controllers/default.controller";


class AmiraServer{
    app : express.Application;
    server : http.Server;
    io : Server;
    port : number;
    db : typeof import("mongoose") | null;

    constructor({ PORT } : SXServerProps){
        this.port = PORT;
        this.app = express();
        this.server = http.createServer(this.app);
        this.io = new Server(this.server, {
            cors: {
                origin: 'http://localhost:5173',
                methods: ['GET', 'POST']
            }
        });
        this.db = null;

        this.setup();
        this.connect();
        this.route();
    }

    setup(){
        this.app.use(cors());
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
    }

    async connect(){
        const database = new Database();
        await database.getConnection();

        this.io.on("connection", (socket) => {
            console.log("User connected to Assitant");

            socket.on("transcript", async (message) => {
                console.log(message);
            });

            socket.on("disconnect", () => {
                console.log("User disconnected");
            });
        });
    }

    route(){
        this.app.use("/api/v:version", verifyAPI);
        this.app.use("/api/v:version/model", modelRouter);
        this.app.use("/api/v:version", noRouteFound);
    }

    listen(){
        this.server.listen(this.port, () => console.log(`Server running on port ${this.port}`));
    }
}

export default AmiraServer;