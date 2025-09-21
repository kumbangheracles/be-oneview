import express from "express";
import router from "./routes/api";
import bodyParser from "body-parser";
import db from "./utils/database";
import docs from "./docs/route";
import cors from "cors";
import "./utils/passports";
import { DEFAULT_PORT } from "./utils/env";
async function init() {
  try {
    const result = await db();
    console.log("Database status: ", result);
    const app = express();

    app.use(cors());
    app.use(bodyParser.json());

    app.get("/", (req, res) => {
      res.status(200).json({
        message: "Server is running",
        data: "null",
      });
    });
    const PORT = DEFAULT_PORT || 3001;

    app.use("/api", router);

    docs(app);
    app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.log(error);
  }
}

init();
