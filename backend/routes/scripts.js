const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const Script = require("../models/Script");

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

// Middleware to verify token - FIXED VERSION
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  
  if (!token) {
    return res.status(401).json({ error: "Access denied" });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = user;
    next(); // Make sure next() is called here
  });
};

// Get all scripts (protected)
router.get("/", authenticateToken, async (req, res) => {
  try {
    const scripts = await Script.find().populate("author", "name email");
    res.json(scripts);
  } catch (error) {
    console.error("Error fetching scripts:", error);
    res.status(500).json({ error: error.message });
  }
});

// Create script (protected)
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { title, content, type } = req.body;
    
    // Validate required fields
    if (!title || !content) {
      return res.status(400).json({ error: "Title and content are required" });
    }

    console.log("1. Creating script for user:", req.user.userId);
    console.log("2. Request body:", { title, content, type });

    // Check if userId exists
    if (!req.user.userId) {
      console.error("❌ No userId in token!");
      return res.status(400).json({ error: "Invalid user token" });
    }

    const scriptData = {
      title,
      content,
      type: type || "general",
      author: req.user.userId
    };
    console.log("3. Script data to save:", scriptData);

    const script = new Script(scriptData);
    console.log("4. Script instance created:", script);

    console.log("5. Attempting to save...");
    const savedScript = await script.save();
    console.log("6. Script saved successfully:", savedScript._id);
    
    // Populate author info before sending response
    console.log("7. Populating author...");
    await savedScript.populate("author", "name email");
    console.log("8. Author populated");
    
    res.status(201).json(savedScript);
    
  } catch (error) {
    console.error("❌ Error creating script:");
    console.error("Error name:", error.name);
    console.error("Error message:", error.message);
    console.error("Error stack:", error.stack);
    
    // Check for validation errors
    if (error.name === 'ValidationError') {
      console.error("Validation errors:", error.errors);
      return res.status(400).json({ 
        error: "Validation failed", 
        details: error.errors 
      });
    }
    
    res.status(500).json({ error: error.message });
  }
});

// Update script (protected)
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { title, content, type } = req.body;
    const scriptId = req.params.id;
    
    // Find script and ensure user owns it or is admin
    const script = await Script.findById(scriptId);
    
    if (!script) {
      return res.status(404).json({ error: "Script not found" });
    }
    
    // Check if user is author or admin
    if (script.author.toString() !== req.user.userId && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized to edit this script" });
    }
    
    // Update fields
    script.title = title || script.title;
    script.content = content || script.content;
    script.type = type || script.type;
    script.updatedAt = Date.now();
    
    await script.save();
    await script.populate("author", "name email");
    
    res.json(script);
    
  } catch (error) {
    console.error("Error updating script:", error);
    res.status(500).json({ error: error.message });
  }
});

// Delete script (protected)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const scriptId = req.params.id;
    
    // Find script and ensure user owns it or is admin
    const script = await Script.findById(scriptId);
    
    if (!script) {
      return res.status(404).json({ error: "Script not found" });
    }
    
    // Check if user is author or admin
    if (script.author.toString() !== req.user.userId && req.user.role !== "admin") {
      return res.status(403).json({ error: "Not authorized to delete this script" });
    }
    
    await Script.findByIdAndDelete(scriptId);
    
    res.json({ message: "Script deleted successfully" });
    
  } catch (error) {
    console.error("Error deleting script:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;