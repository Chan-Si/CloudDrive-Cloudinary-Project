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

// Get current directory path for serving static files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- ROUTES ---

// 1. Root route: Serves the beautiful, styled index.html page
app.get("/", (req, res) => {
  // Serve the physical index.html file that contains the styled upload form
  res.sendFile(path.join(__dirname, "index.html"));
});

// 2. Upload route: Handles file processing and Cloudinary upload
app.post("/upload", upload.single("file"), async (req, res) => {
  try {
    // 1. Get the temporary file path created by Multer
    const filePath = req.file.path;

    // 2. Upload the file to Cloudinary
    const result = await cloudinary.uploader.upload(filePath);

    // 3. Delete the local temporary file after successful upload
    fs.unlinkSync(filePath); 

    // 4. Send the fully STYLED success page response
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
          <title>Upload Successful</title>
          <style>
              /* Styles matching the main Uploader page */
              body {
                  font-family: 'Inter', sans-serif;
                  background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%);
                  color: #333;
                  height: 100vh;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  flex-direction: column;
                  text-align: center;
              }
              .success-box {
                  background: white;
                  padding: 40px;
                  border-radius: 20px;
                  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
                  max-width: 600px;
              }
              h3 {
                  color: #4CAF50; /* Green success color */
                  font-size: 2rem;
                  margin-bottom: 20px;
              }
              p {
                  font-size: 1.1rem;
                  word-break: break-all;
                  margin-bottom: 25px;
              }
              a {
                  color: #4A90E2;
                  text-decoration: none;
                  font-weight: 600;
                  padding: 10px 20px;
                  border-radius: 8px;
                  border: 2px solid #4A90E2;
                  transition: all 0.2s;
              }
              a:hover {
                  background-color: #4A90E2;
                  color: white;
              }
          </style>
      </head>
      <body>
          <div class="success-box">
              <h3>✅ Upload Successful!</h3>
              <p>File URL: <a href="${result.secure_url}" target="_blank">${result.secure_url}</a></p>
              <a href="/">⬅️ Upload another file</a>
          </div>
      </body>
      </html>
    `);
  } catch (error) {
    console.error("Upload Error:", error);
    // Send a styled error page if something goes wrong
    res.status(500).send(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Upload Failed</title>
            <style>
                body { font-family: 'Inter', sans-serif; background: #ffe0e0; color: #cc0000; text-align: center; padding: 50px; }
                h3 { font-size: 2rem; }
                a { color: #cc0000; text-decoration: none; }
            </style>
        </head>
        <body>
            <h3>❌ Upload Failed!</h3>
            <p>Error details logged to server console.</p>
            <a href="/">Try Again</a>
        </body>
        </html>
    `);
  }
});

// Start the server
app.listen(port, () => {
  console.log(`✅ Server running on http://localhost:${port}`);
});