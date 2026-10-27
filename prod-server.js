/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Production server for Google Cloud Run deployment
 */

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8080;

// Serve static assets from Vite build output
app.use(express.static(path.join(__dirname, 'dist')));

// Health check endpoint for Cloud Run
app.get('/healthz', (_req, res) => {
  res.status(200).send('OK');
});

// SPA fallback to index.html
app.get('*', (_req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`FairShift production server listening on port ${PORT}`);
});
