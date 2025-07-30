import express, { Express } from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import postRoute from "./routes/post.routes";
import userRoute from "./routes/user.routes";
import profileRoute from "./routes/profile.routes";

const app: Express = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Use the router

app.use("/user", userRoute);
app.use("/", postRoute);
app.use("/", profileRoute);

export default app;
