const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Import the model

const JWT_SECRET = process.env.JWT_SECRET || "secretkey";

// Login route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Use the User model
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const token = jwt.sign(
      { 
        userId: user._id, 
        role: user.role, 
        name: user.name 
      }, 
      JWT_SECRET, 
      { expiresIn: "8h" }
    );

    res.json({ 
      token, 
      role: user.role, 
      name: user.name 
    });
    
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Register route - FIXED VERSION
router.post("/register", async (req, res) => {
  try {
    const { email, password, name, role } = req.body;  // ✅ Added role here
    
    // Check if user exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Create user with model - include role if provided, otherwise default to "user"
    const user = new User({
      email,
      password: hashedPassword,
      name,
      role: role || "user"  // ✅ Use provided role or default to "user"
    });
    
    await user.save();
    
    const token = jwt.sign(
      { userId: user._id, role: user.role, name: user.name },
      JWT_SECRET,
      { expiresIn: "8h" }
    );
    
    res.status(201).json({ 
      token, 
      role: user.role, 
      name: user.name 
    });
    
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


module.exports = router;