// PostgreSQL database service for Render deployment
const { Pool } = require('pg');

// Create connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize database tables
const initializeDatabase = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS quizzes (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        date DATE NOT NULL,
        location VARCHAR(255) NOT NULL,
        rounds INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS teams (
        id SERIAL PRIMARY KEY,
        quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        team_number INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS scores (
        id SERIAL PRIMARY KEY,
        quiz_id INTEGER REFERENCES quizzes(id) ON DELETE CASCADE,
        team_id INTEGER REFERENCES teams(id) ON DELETE CASCADE,
        round INTEGER NOT NULL,
        points INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(quiz_id, team_id, round)
      )
    `);

    console.log('PostgreSQL database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Database helpers
const dbHelpers = {
  // Quiz operations
  async createQuiz(quizData) {
    const { name, date, location, rounds } = quizData;
    const result = await pool.query(
      'INSERT INTO quizzes (name, date, location, rounds) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, date, location, rounds]
    );
    return result.rows[0];
  },

  async getQuiz(id) {
    const result = await pool.query('SELECT * FROM quizzes WHERE id = $1', [id]);
    return result.rows[0];
  },

  async getAllQuizzes() {
    const result = await pool.query('SELECT * FROM quizzes ORDER BY created_at DESC');
    return result.rows;
  },

  async deleteQuiz(quizId) {
    // CASCADE will automatically delete related teams and scores
    const result = await pool.query('DELETE FROM quizzes WHERE id = $1 RETURNING *', [quizId]);
    return result.rows[0];
  },

  // Team operations
  async createTeam(quizId, teamName) {
    // Get next team number
    const countResult = await pool.query('SELECT COUNT(*) FROM teams WHERE quiz_id = $1', [quizId]);
    const teamNumber = parseInt(countResult.rows[0].count) + 1;

    const result = await pool.query(
      'INSERT INTO teams (quiz_id, name, team_number) VALUES ($1, $2, $3) RETURNING *',
      [quizId, teamName, teamNumber]
    );
    return result.rows[0].id;
  },

  async getTeamsByQuiz(quizId) {
    const result = await pool.query(
      'SELECT * FROM teams WHERE quiz_id = $1 ORDER BY team_number',
      [quizId]
    );
    return result.rows;
  },

  // Score operations
  async saveScore(quizId, teamId, round, points) {
    const result = await pool.query(`
      INSERT INTO scores (quiz_id, team_id, round, points) 
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (quiz_id, team_id, round) 
      DO UPDATE SET points = EXCLUDED.points
      RETURNING *
    `, [quizId, teamId, round, points]);
    return result.rows[0];
  },

  async getScoresByQuiz(quizId) {
    const result = await pool.query(
      'SELECT * FROM scores WHERE quiz_id = $1 ORDER BY round, team_id',
      [quizId]
    );
    return result.rows;
  },

  async calculateTotalScores(quizId) {
    const result = await pool.query(`
      SELECT 
        t.id,
        t.name,
        t.team_number as "teamNumber",
        COALESCE(SUM(s.points), 0) as "totalPoints"
      FROM teams t
      LEFT JOIN scores s ON t.id = s.team_id
      WHERE t.quiz_id = $1
      GROUP BY t.id, t.name, t.team_number
      ORDER BY "totalPoints" DESC, t.team_number
    `, [quizId]);
    return result.rows;
  },

  async isQuizCompleted(quizId) {
    const quizResult = await pool.query('SELECT rounds FROM quizzes WHERE id = $1', [quizId]);
    if (!quizResult.rows[0]) return false;

    const totalRounds = quizResult.rows[0].rounds;
    const teamsResult = await pool.query('SELECT COUNT(*) FROM teams WHERE quiz_id = $1', [quizId]);
    const totalTeams = parseInt(teamsResult.rows[0].count);

    if (totalTeams === 0) return false;

    const scoresResult = await pool.query(
      'SELECT COUNT(*) FROM scores WHERE quiz_id = $1',
      [quizId]
    );
    const totalScores = parseInt(scoresResult.rows[0].count);

    return totalScores >= (totalRounds * totalTeams);
  }
};

module.exports = { dbHelpers, initializeDatabase, pool };
