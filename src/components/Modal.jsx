// Reusable Modal/Popup Component
import React from 'react';
import { Button } from './FormComponents';

export const Modal = ({ isOpen, onClose, title, children, size = 'medium' }) => {
  if (!isOpen) return null;

  const sizeClasses = {
    small: 'max-w-md',
    medium: 'max-w-lg',
    large: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`relative bg-white rounded-lg shadow-xl ${sizeClasses[size]} w-full mx-4 max-h-screen overflow-y-auto`}>
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 focus:outline-none"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
};

// Score Table Component for Leaderboard
export const ScoreTable = ({ teams, currentRound }) => {
  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Positie
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Team #
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Team Naam
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Totaal Punten
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {teams.map((team, index) => (
            <tr key={team.id} className={index < 3 ? 'bg-yellow-50' : ''}>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {index === 0 && '🥇'} {index === 1 && '🥈'} {index === 2 && '🥉'}
                {index >= 3 && `${index + 1}.`}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                Team {team.teamNumber}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {team.name}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {team.totalPoints || 0} punten
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {teams.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          Nog geen teams toegevoegd
        </div>
      )}
    </div>
  );
};

// Delete Confirmation Modal Component
export const DeleteConfirmationModal = ({ isOpen, onClose, onConfirm, quizName, isDeleting }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🗑️ Quiz Verwijderen"
      size="medium"
    >
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H8a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Weet je het zeker?
        </h3>

        <div className="mb-6">
          <p className="text-gray-600 mb-2">
            Je staat op het punt om de volgende quiz te verwijderen:
          </p>
          <p className="font-semibold text-gray-900 bg-gray-50 p-3 rounded">
            "{quizName}"
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div className="text-left">
              <p className="text-sm font-medium text-red-800 mb-1">
                ⚠️ Deze actie kan niet ongedaan gemaakt worden!
              </p>
              <p className="text-sm text-red-700">
                Alle teams, scores en quiz gegevens worden permanent verwijderd.
              </p>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 disabled:opacity-50"
          >
            Annuleren
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
          >
            {isDeleting ? 'Verwijderen...' : '🗑️ Verwijderen'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Detailed Results Table Component
export const DetailedResultsTable = ({ results }) => {
  if (!results || !results.teams) {
    return <div className="text-center py-8 text-gray-500">Geen resultaten beschikbaar</div>;
  }

  const { teams, totalRounds } = results;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50">
              Positie
            </th>
            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50">
              Team
            </th>
            {Array.from({ length: totalRounds }, (_, i) => (
              <th key={i + 1} className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                R{i + 1}
              </th>
            ))}
            <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-blue-50">
              Totaal
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {teams.map((team, index) => (
            <tr key={team.id} className={index < 3 ? 'bg-yellow-50' : ''}>
              <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-inherit">
                <div className="flex items-center">
                  {index === 0 && <span className="text-xl mr-2">🥇</span>}
                  {index === 1 && <span className="text-xl mr-2">🥈</span>}
                  {index === 2 && <span className="text-xl mr-2">🥉</span>}
                  {index >= 3 && <span className="text-gray-500 mr-2">{index + 1}.</span>}
                </div>
              </td>
              <td className="px-4 py-4 whitespace-nowrap sticky left-0 bg-inherit">
                <div className="flex items-center">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium mr-3">
                    {team.teamNumber}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{team.name}</div>
                    <div className="text-sm text-gray-500">Team {team.teamNumber}</div>
                  </div>
                </div>
              </td>
              {Array.from({ length: totalRounds }, (_, i) => (
                <td key={i + 1} className="px-3 py-4 whitespace-nowrap text-center text-sm text-gray-900">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                    {team.roundScores[i + 1] || 0}
                  </span>
                </td>
              ))}
              <td className="px-4 py-4 whitespace-nowrap text-center text-sm font-bold text-gray-900 bg-blue-50">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                  {team.totalPoints}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

// Quiz Completion Modal Component
export const QuizCompletionModal = ({ isOpen, onClose, results, onShowDetailed }) => {
  if (!results || !results.teams) {
    return null;
  }

  const { quiz, teams } = results;
  const winner = teams[0];

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {}} // Prevent closing by clicking outside
      title="🏁 Pubquiz Afgerond!"
      size="large"
    >
      <div className="text-center">
        {/* Celebration Header */}
        <div className="mb-8">
          <div className="mx-auto w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-4xl">🎉</span>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Gefeliciteerd!
          </h2>
          <p className="text-gray-600">
            De pubquiz "{quiz.name}" is succesvol afgerond!
          </p>
        </div>

        {/* Winner Announcement */}
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-center mb-4">
            <span className="text-6xl mr-4">🏆</span>
            <div className="text-left">
              <h3 className="text-2xl font-bold text-white mb-1">De Winnaar!</h3>
              <p className="text-yellow-100 text-lg">
                Team {winner.teamNumber}: {winner.name}
              </p>
              <p className="text-yellow-100 text-xl font-bold">
                {winner.totalPoints} punten
              </p>
            </div>
          </div>
        </div>

        {/* Top 3 */}
        <div className="mb-8">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">🏅 Top 3</h4>
          <div className="grid grid-cols-3 gap-4">
            {teams.slice(0, 3).map((team, index) => (
              <div key={team.id} className="text-center">
                <div className="text-3xl mb-2">
                  {index === 0 && '🥇'}
                  {index === 1 && '🥈'}
                  {index === 2 && '🥉'}
                </div>
                <div className="text-sm font-medium text-gray-900">{team.name}</div>
                <div className="text-xs text-gray-500">Team {team.teamNumber}</div>
                <div className="text-sm font-bold text-blue-600">{team.totalPoints} pts</div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={onShowDetailed}
            className="w-full px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            📊 Bekijk Gedetailleerde Resultaten
          </button>

          <button
            onClick={onClose}
            className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
          >
            Terug naar Home
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Round Management Modal Component
export const RoundManagementModal = ({ isOpen, onClose, currentRound, roundScores, onScoreUpdate }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`📝 Beheer Ronde ${currentRound}`}
      size="large"
    >
      <div className="mb-6">
        <p className="text-gray-600">
          Overzicht van alle teams en hun scores voor ronde {currentRound}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Team #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Team Naam
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Punten
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actie
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {roundScores.map((team) => (
              <tr key={team.id} className={team.hasScore ? 'bg-green-50' : 'bg-yellow-50'}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {team.teamNumber}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{team.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {team.hasScore ? (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                      {team.points} punten
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm">Nog niet ingevuld</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {team.hasScore ? (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      ✅ Voltooid
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      ⏳ Wachtend
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  <button
                    onClick={() => onScoreUpdate(team)}
                    className={`inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                      team.hasScore 
                        ? 'text-blue-700 bg-blue-100 hover:bg-blue-200 focus:ring-blue-500' 
                        : 'text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                    }`}
                  >
                    {team.hasScore ? '✏️ Wijzigen' : '➕ Invoeren'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-blue-900">Voortgang Ronde {currentRound}</p>
            <p className="text-sm text-blue-700">
              {roundScores.filter(t => t.hasScore).length} van {roundScores.length} teams hebben punten
            </p>
          </div>
          <div className="flex items-center">
            <div className="w-32 bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(roundScores.filter(t => t.hasScore).length / roundScores.length) * 100}%`
                }}
              />
            </div>
            <span className="ml-3 text-sm font-medium text-blue-900">
              {Math.round((roundScores.filter(t => t.hasScore).length / roundScores.length) * 100)}%
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <Button onClick={onClose} variant="primary">
          Sluiten
        </Button>
      </div>
    </Modal>
  );
};

// Next Round Confirmation Modal Component
export const NextRoundConfirmationModal = ({
  isOpen,
  onClose,
  currentRound,
  nextRound,
  roundScores,
  onConfirm,
  onCancel,
  isLastRound = false
}) => {
  const teamsWithoutScore = roundScores.filter(team => !team.hasScore);
  const allTeamsHaveScores = teamsWithoutScore.length === 0;

  // Determine the correct text based on whether it's the last round
  const actionText = isLastRound ? "Rond pubquiz af" : `Naar Ronde ${nextRound}`;
  const titleText = isLastRound ? "🏁 Pubquiz Afronden" : `🔄 Naar Ronde ${nextRound}`;
  const confirmText = isLastRound ? "doorgaan met het afronden van de pubquiz" : `doorgaan naar ronde ${nextRound}`;
  const buttonText = isLastRound ? "🏁 Rond Pubquiz Af" : `🔄 Naar Ronde ${nextRound}`;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={titleText}
      size="large"
    >
      <div className="text-center">
        {allTeamsHaveScores ? (
          // All teams have scores - simple confirmation
          <div>
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">✅</span>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Ronde {currentRound} Voltooid!
            </h3>

            <p className="text-gray-600 mb-6">
              Alle teams hebben een score voor ronde {currentRound}.
              Wil je {confirmText}?
            </p>

            <div className="flex space-x-3 justify-center">
              <button
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                Annuleren
              </button>
              <button
                onClick={onConfirm}
                className={`px-6 py-2 text-white rounded-md focus:outline-none focus:ring-2 ${
                  isLastRound 
                    ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' 
                    : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                }`}
              >
                {buttonText}
              </button>
            </div>
          </div>
        ) : (
          // Some teams missing scores - warning with details
          <div>
            <div className="mx-auto w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-2xl">⚠️</span>
            </div>

            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Ontbrekende Scores Gevonden
            </h3>

            <div className="text-left mb-6">
              <p className="text-gray-600 mb-4 text-center">
                De volgende teams hebben nog geen score voor ronde {currentRound}:
              </p>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <ul className="space-y-2">
                  {teamsWithoutScore.map(team => (
                    <li key={team.id} className="flex items-center text-sm">
                      <span className="inline-flex items-center justify-center w-6 h-6 bg-yellow-200 text-yellow-800 rounded-full text-xs font-medium mr-3">
                        {team.teamNumber}
                      </span>
                      <span className="text-gray-900 font-medium">{team.name}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <svg className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01" />
                  </svg>
                  <div>
                    <p className="text-sm font-medium text-red-800 mb-1">
                      Waarschuwing
                    </p>
                    <p className="text-sm text-red-700">
                      Als je {confirmText}, krijgen de bovenstaande teams automatisch
                      <strong> 0 punten</strong> voor ronde {currentRound}.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-gray-700 text-center">
                <strong>Weet je zeker dat je door wilt gaan?</strong>
              </p>
            </div>

            <div className="flex space-x-3 justify-center">
              <button
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                ← Terug naar Score Invoer
              </button>
              <button
                onClick={onConfirm}
                className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                ⚠️ Ja, Doorgaan (0 punten toekennen)
              </button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

// Final Confirmation Modal for last round
export const FinalConfirmationModal = ({
  isOpen,
  onClose,
  onFinishQuiz,
  onEditRounds,
  roundScores,
  currentRound
}) => {
  const teamsWithoutScore = roundScores.filter(team => !team.hasScore);
  const allTeamsHaveScores = teamsWithoutScore.length === 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="🏁 Quiz Afronden"
      size="large"
    >
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-2xl">🤔</span>
        </div>

        <h3 className="text-xl font-semibold text-gray-900 mb-4">
          Wat wil je doen?
        </h3>

        <p className="text-gray-600 mb-6">
          Je bent bij de laatste ronde. Kies wat je wilt doen:
        </p>

        {!allTeamsHaveScores && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6 text-left">
            <p className="text-sm font-medium text-yellow-800 mb-2">
              ⚠️ Let op: Niet alle teams hebben een score voor ronde {currentRound}
            </p>
            <p className="text-sm text-yellow-700">
              {teamsWithoutScore.length} team(s) missen nog een score.
            </p>
          </div>
        )}

        <div className="space-y-3">
          <button
            onClick={onEditRounds}
            className="w-full px-6 py-3 border border-blue-300 text-blue-700 rounded-md hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-center"
          >
            <span className="mr-2">📝</span>
            Eerst rondes bewerken/controleren
          </button>

          <button
            onClick={onFinishQuiz}
            className={`w-full px-6 py-3 text-white rounded-md focus:outline-none focus:ring-2 flex items-center justify-center ${
              allTeamsHaveScores 
                ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' 
                : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
            }`}
          >
            <span className="mr-2">{allTeamsHaveScores ? '🏁' : '⚠️'}</span>
            {allTeamsHaveScores
              ? 'Quiz afronden en resultaten bekijken'
              : 'Quiz afronden (ontbrekende scores = 0)'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Round Edit Table Component for editing scores in a specific round
export const RoundEditTable = ({ quizId, roundNumber, teams, onScoreUpdate, onClose }) => {
  const [roundScores, setRoundScores] = React.useState([]);
  const [loading, setLoading] = React.useState(true);
  const [editingTeam, setEditingTeam] = React.useState(null);
  const [editScore, setEditScore] = React.useState('');

  React.useEffect(() => {
    loadRoundScores();
  }, [quizId, roundNumber]);

  const loadRoundScores = async () => {
    try {
      const { dbHelpers } = await import('../db/database');
      const allScores = await dbHelpers.getScoresByQuiz(quizId);

      // Create round scores with team information
      const roundData = teams.map(team => {
        const score = allScores.find(s => s.teamId === team.id && s.round === roundNumber);
        return {
          ...team,
          hasScore: !!score,
          points: score ? score.points : 0,
          scoreId: score ? score.id : null
        };
      });

      setRoundScores(roundData);
    } catch (error) {
      console.error('Error loading round scores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (team) => {
    setEditingTeam(team.id);
    setEditScore(team.hasScore ? team.points.toString() : '');
  };

  const handleSaveScore = async (team) => {
    const newScore = parseInt(editScore);

    if (isNaN(newScore) || newScore < 0) {
      alert('Voer een geldig aantal punten in (0 of hoger)');
      return;
    }

    try {
      await onScoreUpdate(team.id, newScore, roundNumber);
      await loadRoundScores(); // Reload data
      setEditingTeam(null);
      setEditScore('');
    } catch (error) {
      console.error('Error updating score:', error);
    }
  };

  const handleCancelEdit = () => {
    setEditingTeam(null);
    setEditScore('');
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Scores laden...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6">
        <p className="text-gray-600">
          Bewerk de scores voor ronde {roundNumber}. Klik op een score om deze aan te passen.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Team #
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Team Naam
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Punten
              </th>
              <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actie
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {roundScores.map((team) => (
              <tr key={team.id} className={team.hasScore ? 'bg-green-50' : 'bg-gray-50'}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium">
                      {team.teamNumber}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{team.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {editingTeam === team.id ? (
                    <div className="flex items-center justify-center space-x-2">
                      <input
                        type="number"
                        value={editScore}
                        onChange={(e) => setEditScore(e.target.value)}
                        min="0"
                        className="w-20 px-2 py-1 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
                        autoFocus
                      />
                      <button
                        onClick={() => handleSaveScore(team)}
                        className="text-green-600 hover:text-green-800"
                        title="Opslaan"
                      >
                        ✅
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        className="text-red-600 hover:text-red-800"
                        title="Annuleren"
                      >
                        ❌
                      </button>
                    </div>
                  ) : (
                    <span
                      className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium cursor-pointer hover:bg-opacity-80 ${
                        team.hasScore 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}
                      onClick={() => handleEditClick(team)}
                      title="Klik om te bewerken"
                    >
                      {team.hasScore ? `${team.points} punten` : 'Geen score'}
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-center">
                  {editingTeam === team.id ? (
                    <span className="text-xs text-gray-500">Bewerken...</span>
                  ) : (
                    <button
                      onClick={() => handleEditClick(team)}
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      ✏️ Bewerk
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-blue-900">Status Ronde {roundNumber}</p>
            <p className="text-sm text-blue-700">
              {roundScores.filter(t => t.hasScore).length} van {roundScores.length} teams hebben een score
            </p>
          </div>
          <div className="flex items-center">
            <div className="w-32 bg-blue-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(roundScores.filter(t => t.hasScore).length / roundScores.length) * 100}%`
                }}
              />
            </div>
            <span className="ml-3 text-sm font-medium text-blue-900">
              {Math.round((roundScores.filter(t => t.hasScore).length / roundScores.length) * 100)}%
            </span>
          </div>
        </div>
      </div>

      <div className="mt-6 text-center">
        <Button onClick={onClose} variant="primary">
          Klaar
        </Button>
      </div>
    </div>
  );
};

// Alert Modal Component (replaces window.alert)
export const AlertModal = ({ isOpen, onClose, title, message, type = 'info' }) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      default:
        return 'ℹ️';
    }
  };

  const getColorClasses = () => {
    switch (type) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || 'Melding'}
      size="medium"
    >
      <div className="text-center">
        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${getColorClasses()}`}>
          <span className="text-2xl">{getIcon()}</span>
        </div>

        <p className="text-gray-700 mb-6 whitespace-pre-line">
          {message}
        </p>

        <Button onClick={onClose} variant="primary" className="w-full">
          OK
        </Button>
      </div>
    </Modal>
  );
};

// Confirm Modal Component (replaces window.confirm)
export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Bevestigen',
  cancelText = 'Annuleren',
  type = 'warning'
}) => {
  const getIcon = () => {
    switch (type) {
      case 'danger':
        return '🚨';
      case 'warning':
        return '⚠️';
      case 'question':
        return '❓';
      default:
        return '⚠️';
    }
  };

  const getColorClasses = () => {
    switch (type) {
      case 'danger':
        return 'bg-red-100 text-red-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'question':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || 'Bevestiging'}
      size="medium"
    >
      <div className="text-center">
        <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${getColorClasses()}`}>
          <span className="text-2xl">{getIcon()}</span>
        </div>

        <p className="text-gray-700 mb-6 whitespace-pre-line">
          {message}
        </p>

        <div className="space-y-3">
          <Button onClick={handleConfirm} variant="primary" className="w-full">
            {confirmText}
          </Button>
          <Button onClick={onClose} variant="secondary" className="w-full">
            {cancelText}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
