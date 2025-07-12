import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import postRoute from "./routes/post.routes";
import userRoute from "./routes/user.routes";

const app: Express = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use the router
app.use("/", postRoute);
app.use("/user", userRoute);

export default app;
