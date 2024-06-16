const mongoose = require("mongoose");

const ArticleSchema = mongoose.Schema({
  articleUrl: {
    type: String,
    required: true
  },
  posterUrl: {
    type: String,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Article = mongoose.model("Article", ArticleSchema);
module.exports = Article;
