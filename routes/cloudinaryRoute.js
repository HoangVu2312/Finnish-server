const cloudinary = require("cloudinary");
const router = require("express").Router();
require("dotenv").config();

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
  secure: true, // Set secure to true to ensure HTTPS URLs
});

// delete img url out of images array
router.delete("/:public_id", async (req, res) => {
  const public_id = req.params;
  try {
    await cloudinary.uploader.destroy(public_id);
    res.status(200).send();
  } catch (e) {
    res.status(400).send(e.message);
  }
});

router.post("/upload", async (req, res) => {
  try {
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "raw",
      folder: "pdf_files", // Optional: Specify a folder to organize PDF files
    });
    res.status(200).json(result);
  } catch (error) {
    res.status(400).send(error.message);
  }
});

module.exports = router;
