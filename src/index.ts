import express, { Express } from "express";
import router from "./routes/routes";
import createFileIfNotExists from "./config/config";
import fs from "fs";
import path from "path";
const app: Express = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Check if the post.json file exists, if not, create it

if (!fs.existsSync(path.join("src", "data", "post.json"))) {
  createFileIfNotExists();
} else {
  console.log("File already exists, no need to create.");
}

// Use the router
app.use("/", router);

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
