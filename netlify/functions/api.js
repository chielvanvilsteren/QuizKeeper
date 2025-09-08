// Netlify Functions API for PubQuiz
// This replaces the Express server for Netlify deployment

const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');

// Import your existing routes
const quizzesRouter = require('../../server/routes/quizzes');
const teamsRouter = require('../../server/routes/teams');
const scoresRouter = require('../../server/routes/scores');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes - prefix with /api since Netlify Functions will handle the /api part
app.use('/quizzes', quizzesRouter);
app.use('/teams', teamsRouter);
app.use('/scores', scoresRouter);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'PubQuiz API via Netlify Functions' });
});

// Export as serverless function
module.exports.handler = serverless(app);
