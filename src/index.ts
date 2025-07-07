import app from "./app";
import connectToDatabase from "../dbserver";

const PORT = 3000;

if (process.env.NODE_ENV !== "test") {
  connectToDatabase();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
