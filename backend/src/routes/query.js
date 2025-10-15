import express from "express";
const router = express.Router();

// POST /api/query
router.post("/", async (req, res) => {
  const { question, filename } = req.body;
  if (!question || !filename) {
    return res.status(400).json({ error: "Missing question or filename" });
  }
  try {
    // Dummy AI response logic - Replace with real AI logic
    const answer = `Pretend AI answer for "${question}" from "${filename}"`;
    res.json({ answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to process query." });
  }
});

export default router;
