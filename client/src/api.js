import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

export const fetchIssues = (owner, repo) =>
  axios.get(`${API_BASE}/github/issues`, { params: { owner, repo } });

export const cloneRepo = (owner, repo) =>
  axios.post(`${API_BASE}/clone`, { owner, repo });

export const analyzeIssue = (issueId, model) =>
  axios.post(`${API_BASE}/analyze`, { issueId, model });

export const suggestFix = (issueId, model, targetFile) =>
  axios.post(`${API_BASE}/fix`, { issueId, model, targetFile });

export const acceptFix = (issueId, targetFile) =>
  axios.post(`${API_BASE}/accept`, { issueId, targetFile });

export const rejectFix = (issueId) =>
  axios.post(`${API_BASE}/reject`, { issueId });

export const getFileContent = (issueId, targetFile) =>
  axios.get(`${API_BASE}/file-content`, { params: { issueId, targetFile } });

export const fetchModels = () =>
  axios.get(`${API_BASE}/models`);