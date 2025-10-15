import express from "express";
import multer from "multer";
import { loadPDFandStore } from "../utils/pdfLoader.js";

const router = express.Router();

// Multer setup: store uploaded files temporarily
const storage = multer.diskStorage({
  destination: "./uploads",
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// POST /api/upload
router.post("/", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;
    // Process PDF: extract text + create embeddings + save to Chroma
    await loadPDFandStore(filePath);
    res.json({ message: "File uploaded and indexed successfully!" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "File processing failed." });
  }
});

export default router;
