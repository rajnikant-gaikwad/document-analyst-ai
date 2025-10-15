import express from "express";
import { answerQuestion } from "../utils/chain.js";
const router = express.Router();

// POST /api/query
router.post("/", async (req, res) => {
  const { question } = req.body;
  try {
    const answer = await answerQuestion(question);
    res.json({ answer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to process query." });
  }
});

export default router;
