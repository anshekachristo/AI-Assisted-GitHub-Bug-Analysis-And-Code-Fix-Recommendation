const mongoose = require('mongoose');

const fileFixSchema = new mongoose.Schema({
  filePath: { type: String, required: true },
  suggestedFix: String,
  originalCode: String,
  fixedCode: String,
  status: { type: String, default: 'pending' } // pending, accepted, rejected
}, { _id: false });

const issueSchema = new mongoose.Schema({
  githubId: { type: Number, required: true, unique: true },
  number: Number,
  title: String,
  body: String,
  labels: [String],
  url: String,
  owner: String,
  repo: String,
  createdAt: Date,

  // AI analysis results (filled in later steps)
  suggestedFile: String,
  affectedFiles: [String],
  suggestedFix: String,
  originalCode: String,
  fixedCode: String,

  // NEW: per-file fixes for any affected file the user chooses to fix
  fileFixes: [fileFixSchema],

  status: { type: String, default: 'pending' } // pending, accepted, rejected
});

module.exports = mongoose.model('Issue', issueSchema);