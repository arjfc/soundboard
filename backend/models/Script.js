const mongoose = require("mongoose");

const scriptSchema = new mongoose.Schema({
  title: { 
    type: String, 
    required: true 
  },
  content: { 
    type: String, 
    required: true 
  },
  type: { 
    type: String, 
    enum: ["opener", "closer", "general"], 
    default: "general" 
  },
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  }
}, {
  timestamps: true // This automatically adds createdAt and updatedAt!
});

// Remove any pre-save hooks if they exist - they're not needed with timestamps: true

module.exports = mongoose.model("Script", scriptSchema);