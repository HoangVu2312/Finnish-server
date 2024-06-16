const express = require("express");
const router = express.Router();
const Article = require("../models/Article");
const { verifyToken } = require("../authorization/authorization");

// Create a new article
router.post("/create", verifyToken, async (req, res) => {
  try {
    const { articleUrl, posterUrl, title, description } = req.body;

    const newArticle = new Article({
      articleUrl,
      posterUrl,
      title,
      description
    });

    await newArticle.save();

    const articles = await Article.find().sort({ createdAt: -1 });

    res.status(201).json(articles);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all articles
router.get("/", async (req, res) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 });
    res.status(200).json(articles);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete an article
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    await Article.findByIdAndDelete(id);
    const articles = await Article.find().sort({ createdAt: -1 });
    res.status(200).json(articles);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
