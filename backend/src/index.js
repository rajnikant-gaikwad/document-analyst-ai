// Step 1: Import core modules
import express, { json } from "express";
import cors from "cors";
import { config } from "dotenv";
import uploadRoute from "./routes/upload.js";
import queryRoute from "./routes/query.js";

config();
const app = express();
app.use(cors());
app.use(json());

// Step 2: Routes for uploading documents and querying
app.use("/api/upload", uploadRoute);
app.use("/api/query", queryRoute);

// Step 3: Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
