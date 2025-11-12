// Import required packages
import express from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Load environment variables
dotenv.config({ path: "./.env" });

const app = express();
const port = process.env.PORT || 5000;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

// Multer setup - temporary storage before upload
const upload = multer({ dest: "uploads/" });

// Get current directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve the HTML page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Upload route
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    const filePath = req.file.path;

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(filePath);

    // Delete local file after upload
    fs.unlinkSync(filePath);

    res.send(`
      <h3>✅ Upload Successful!</h3>
      <p>File URL: <a href="${result.secure_url}" target="_blank">${result.secure_url}</a></p>
      <a href="/">⬅️ Upload another file</a>
    `);
  } catch (error) {
    console.error("Upload Error:", error);
    res.status(500).send("❌ Upload failed. Check console for details.");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});
