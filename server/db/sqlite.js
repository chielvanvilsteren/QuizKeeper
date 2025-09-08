const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Create database file in server/db directory
const dbPath = path.join(__dirname, 'pubquiz.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Enable foreign key constraints
db.run('PRAGMA foreign_keys = ON');

// Initialize database tables
const initializeDatabase = () => {
  return new Promise((resolve, reject) => {
    db.serialize(() => {
      // Create quizzes table
      db.run(`
        CREATE TABLE IF NOT EXISTS quizzes (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL,
          date TEXT NOT NULL,
          location TEXT NOT NULL,
          rounds INTEGER NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);

      // Create teams table
      db.run(`
        CREATE TABLE IF NOT EXISTS teams (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          quizId INTEGER NOT NULL,
          name TEXT NOT NULL,
          teamNumber INTEGER NOT NULL,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (quizId) REFERENCES quizzes(id) ON DELETE CASCADE
        )
      `);

      // Create scores table
      db.run(`
        CREATE TABLE IF NOT EXISTS scores (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          quizId INTEGER NOT NULL,
          teamId INTEGER NOT NULL,
          round INTEGER NOT NULL,
          points INTEGER NOT NULL DEFAULT 0,
          createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (quizId) REFERENCES quizzes(id) ON DELETE CASCADE,
          FOREIGN KEY (teamId) REFERENCES teams(id) ON DELETE CASCADE,
          UNIQUE(teamId, round)
        )
      `, (err) => {
        if (err) {
          console.error('Error creating tables:', err);
          reject(err);
        } else {
          console.log('SQLite database tables initialized successfully');
          resolve();
        }
      });
    });
  });
};

// Database helper functions (adapted for sqlite3 callback API)
const dbHelpers = {
  // Quiz operations
  createQuiz(quizData) {
    return new Promise((resolve, reject) => {
      const stmt = db.prepare(`
        INSERT INTO quizzes (name, date, location, rounds)
        VALUES (?, ?, ?, ?)
      `);
      stmt.run([quizData.name, quizData.date, quizData.location, quizData.rounds], function(err) {
        if (err) {
          console.error('Error creating quiz:', err);
          reject(new Error('Kon quiz niet aanmaken'));
        } else {
          resolve(this.lastID);
        }
      });
      stmt.finalize();
    });
  },

  getQuiz(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM quizzes WHERE id = ?', [id], (err, row) => {
        if (err) {
          console.error('Error getting quiz:', err);
          reject(new Error('Kon quiz niet ophalen'));
        } else {
          resolve(row);
        }
      });
    });
  },

  getAllQuizzes() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM quizzes ORDER BY createdAt DESC', [], (err, rows) => {
        if (err) {
          console.error('Error getting all quizzes:', err);
          reject(new Error('Kon quizzes niet ophalen'));
        } else {
          resolve(rows);
        }
      });
    });
  },

  deleteQuiz(quizId) {
    return new Promise((resolve, reject) => {
      db.run('DELETE FROM quizzes WHERE id = ?', [quizId], function(err) {
        if (err) {
          console.error('Error deleting quiz:', err);
          reject(new Error('Kon quiz niet verwijderen'));
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  },

  // Team operations
  createTeam(quizId, teamName) {
    return new Promise((resolve, reject) => {
      // Get next team number for this quiz
      db.get('SELECT COUNT(*) as count FROM teams WHERE quizId = ?', [quizId], (err, row) => {
        if (err) {
          reject(new Error('Kon team niet aanmaken'));
          return;
        }

        const teamNumber = (row.count || 0) + 1;
        const stmt = db.prepare(`
          INSERT INTO teams (quizId, name, teamNumber)
          VALUES (?, ?, ?)
        `);

        stmt.run([quizId, teamName, teamNumber], function(err) {
          if (err) {
            console.error('Error creating team:', err);
            reject(new Error('Kon team niet aanmaken'));
          } else {
            resolve(this.lastID);
          }
        });
        stmt.finalize();
      });
    });
  },

  getTeamsByQuiz(quizId) {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM teams WHERE quizId = ? ORDER BY teamNumber', [quizId], (err, rows) => {
        if (err) {
          console.error('Error getting teams:', err);
          reject(new Error('Kon teams niet ophalen'));
        } else {
          resolve(rows);
        }
      });
    });
  },

  // Score operations
  saveScore(quizId, teamId, round, points) {
    return new Promise((resolve, reject) => {
      console.log('Saving score:', { quizId, teamId, round, points });

      // Validate input parameters
      if (!quizId || !teamId || !round || points === undefined || points === null) {
        reject(new Error('Ongeldige parameters voor score opslaan'));
        return;
      }

      // Use INSERT OR REPLACE to handle both insert and update
      const stmt = db.prepare(`
        INSERT OR REPLACE INTO scores (quizId, teamId, round, points)
        VALUES (?, ?, ?, ?)
      `);

      stmt.run([
        parseInt(quizId),
        parseInt(teamId),
        parseInt(round),
        parseInt(points)
      ], function(err) {
        if (err) {
          console.error('Error saving score:', err);
          reject(new Error(`Kon score niet opslaan: ${err.message}`));
        } else {
          resolve(this.lastID);
        }
      });
      stmt.finalize();
    });
  },

  updateScore(quizId, teamId, round, newPoints) {
    // Same as saveScore since we use INSERT OR REPLACE
    return this.saveScore(quizId, teamId, round, newPoints);
  },

  getScoresByQuiz(quizId) {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM scores WHERE quizId = ? ORDER BY teamId, round', [quizId], (err, rows) => {
        if (err) {
          console.error('Error getting scores:', err);
          reject(new Error('Kon scores niet ophalen'));
        } else {
          resolve(rows);
        }
      });
    });
  },

  // Calculate total scores for all teams in a quiz
  async calculateTotalScores(quizId) {
    try {
      const teams = await this.getTeamsByQuiz(quizId);
      const scores = await this.getScoresByQuiz(quizId);

      return teams.map(team => {
        const teamScores = scores.filter(score => score.teamId === team.id);
        const totalPoints = teamScores.reduce((sum, score) => sum + (score.points || 0), 0);

        return {
          ...team,
          totalPoints,
          scores: teamScores
        };
      }).sort((a, b) => b.totalPoints - a.totalPoints); // Sort by highest score first
    } catch (error) {
      console.error('Error calculating total scores:', error);
      throw new Error('Kon totaalscores niet berekenen');
    }
  },

  // Get detailed quiz results with scores per round per team
  async getDetailedQuizResults(quizId) {
    try {
      const quiz = await this.getQuiz(quizId);
      const teams = await this.getTeamsByQuiz(quizId);
      const scores = await this.getScoresByQuiz(quizId);

      // Create matrix of scores per team per round
      const results = teams.map(team => {
        const teamResult = {
          id: team.id,
          teamNumber: team.teamNumber,
          name: team.name,
          roundScores: {},
          totalPoints: 0
        };

        // Initialize all rounds with 0
        for (let round = 1; round <= quiz.rounds; round++) {
          teamResult.roundScores[round] = 0;
        }

        // Fill in actual scores
        const teamScores = scores.filter(score => score.teamId === team.id);
        teamScores.forEach(score => {
          teamResult.roundScores[score.round] = score.points || 0;
          teamResult.totalPoints += score.points || 0;
        });

        return teamResult;
      });

      // Sort by total points (highest first)
      results.sort((a, b) => b.totalPoints - a.totalPoints);

      return {
        quiz,
        teams: results,
        totalRounds: quiz.rounds
      };
    } catch (error) {
      console.error('Error getting detailed quiz results:', error);
      throw new Error('Kon gedetailleerde resultaten niet ophalen');
    }
  },

  // Check if quiz is completely finished (all rounds completed)
  async isQuizCompleted(quizId) {
    try {
      const quiz = await this.getQuiz(quizId);
      const teams = await this.getTeamsByQuiz(quizId);

      if (!quiz || teams.length === 0) {
        return false;
      }

      return new Promise((resolve, reject) => {
        db.get('SELECT COUNT(*) as count FROM scores WHERE quizId = ?', [quizId], (err, row) => {
          if (err) {
            console.error('Error checking if quiz completed:', err);
            resolve(false);
          } else {
            const expectedScores = teams.length * quiz.rounds;
            resolve((row.count || 0) >= expectedScores);
          }
        });
      });
    } catch (error) {
      console.error('Error checking if quiz completed:', error);
      return false;
    }
  }
};

// Initialize database on startup
initializeDatabase().catch(console.error);

module.exports = { db, dbHelpers };
