import app from "./app";
import { config } from "./config/config";

const PORT = 3000;

if (process.env.NODE_ENV !== "test") {
  config.mongodb();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
