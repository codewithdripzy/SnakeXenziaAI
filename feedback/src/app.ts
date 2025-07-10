import dotenv from "dotenv";
import AmiraServer from "./server";

// initialize enviromental variable configuration
dotenv.config();

// instanciate server class
const PORT = Number(process.env.PORT ?? "");
const server = new AmiraServer({ PORT });

// call the listen method in the server class
server.listen();