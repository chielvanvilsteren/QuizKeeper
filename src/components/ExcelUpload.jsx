// Excel Upload Component for importing teams
import React, { useState } from 'react';
import * as XLSX from 'xlsx';

export const ExcelUpload = ({ onTeamsImported, disabled = false }) => {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  const processExcelFile = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });

          // Get first worksheet
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];

          // Convert to JSON
          const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

          // Extract team data (skip first row as it contains headers)
          const teams = [];

          // Start from index 1 to skip header row
          for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];

            if (row && row.length >= 2) {
              const teamNumber = row[0]; // First column: team number
              const teamName = row[1];   // Second column: team name

              // Validate team data
              if (teamName && String(teamName).trim()) {
                const cleanTeamName = String(teamName).trim();
                const cleanTeamNumber = teamNumber ? String(teamNumber).trim() : null;

                // Skip if team name is too short or looks like a header
                if (cleanTeamName.length > 1 &&
                    cleanTeamName.toLowerCase() !== 'teamnaam' &&
                    cleanTeamName.toLowerCase() !== 'team naam' &&
                    cleanTeamName.toLowerCase() !== 'naam' &&
                    cleanTeamName.toLowerCase() !== 'name') {

                  teams.push({
                    teamNumber: cleanTeamNumber,
                    teamName: cleanTeamName,
                    originalRow: i + 1 // For error reporting (Excel rows start at 1)
                  });
                }
              }
            }
          }

          resolve(teams);
        } catch (error) {
          reject(new Error('Fout bij het lezen van Excel bestand: ' + error.message));
        }
      };

      reader.onerror = () => {
        reject(new Error('Fout bij het lezen van het bestand'));
      };

      reader.readAsArrayBuffer(file);
    });
  };

  const handleFileSelect = async (file) => {
    if (!file) return;

    // Check if it's an Excel file
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-excel', // .xls
      'text/csv' // .csv
    ];

    if (!validTypes.includes(file.type) && !file.name.match(/\.(xlsx|xls|csv)$/i)) {
      alert('Alleen Excel (.xlsx, .xls) en CSV bestanden zijn toegestaan');
      return;
    }

    setUploading(true);

    try {
      const teamData = await processExcelFile(file);

      if (teamData.length === 0) {
        alert('Geen geldige teams gevonden in het bestand.\n\nZorg ervoor dat:\n• Eerste rij bevat kolomnamen\n• Kolom A bevat teamnummers\n• Kolom B bevat teamnamen');
        return;
      }

      // Create preview message
      const previewTeams = teamData.slice(0, 10);
      const previewText = previewTeams
        .map(team => `${team.teamNumber ? `#${team.teamNumber}: ` : ''}${team.teamName}`)
        .join('\n');

      const remainingCount = teamData.length - previewTeams.length;
      const fullPreview = previewText + (remainingCount > 0 ? `\n... en nog ${remainingCount} meer` : '');

      // Show preview and confirm
      const confirmed = window.confirm(
        `${teamData.length} teams gevonden:\n\n${fullPreview}\n\nWil je deze teams importeren?\n\nLet op: Als je Excel teamnummers hebt, worden deze genegeerd en krijgen teams automatisch nieuwe nummers in volgorde van toevoeging.`
      );

      if (confirmed) {
        // Extract just the team names for the callback
        const teamNames = teamData.map(team => team.teamName);
        onTeamsImported(teamNames);
      }
    } catch (error) {
      console.error('Error processing Excel file:', error);
      alert(error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
    // Reset input
    e.target.value = '';
  };

  return (
    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
      <div
        className={`${dragOver ? 'border-blue-400 bg-blue-50' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} transition-all duration-200`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !disabled && !uploading && document.getElementById('excel-file-input').click()}
      >
        <input
          id="excel-file-input"
          type="file"
          accept=".xlsx,.xls,.csv"
          onChange={handleFileInput}
          className="hidden"
          disabled={disabled || uploading}
        />

        <div className="space-y-2">
          <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
            <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </svg>

          <div>
            <p className="text-sm text-gray-600">
              {uploading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Bestand verwerken...
                </span>
              ) : (
                <>
                  <span className="font-medium text-blue-600">Klik om Excel bestand te uploaden</span>
                  <span className="text-gray-500"> of sleep het hierheen</span>
                </>
              )}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Ondersteunt .xlsx, .xls en .csv bestanden
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md text-left">
        <p className="text-sm text-blue-800 font-medium mb-2">💡 Tips voor Excel import:</p>
        <ul className="text-xs text-blue-700 space-y-1">
          <li>• Eerste rij bevat kolomnamen (wordt overgeslagen)</li>
          <li>• Kolom A: Teamnummers (optioneel, worden genegeerd)</li>
          <li>• Kolom B: Teamnamen (verplicht)</li>
          <li>• Elke rij wordt een apart team</li>
          <li>• Preview wordt getoond voor bevestiging</li>
        </ul>
      </div>
    </div>
  );
};
