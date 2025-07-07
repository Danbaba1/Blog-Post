import express, { Express } from "express";
import router from "./routes/routes";

const app: Express = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Use the router
app.use("/", router);

export default app;
