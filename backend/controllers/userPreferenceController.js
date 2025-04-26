const fs = require('fs').promises;
const path = require('path');

// Define the path to the preferences file
const preferencesFilePath = path.join(__dirname, '..', 'preferences.json'); // Store it in the backend directory

// Default preferences
const defaultPreferences = {
	filter: 'none',
	gridSize: '1x4',
};

// Helper function to read preferences from file
async function readPreferencesFromFile() {
	try {
		const data = await fs.readFile(preferencesFilePath, 'utf8');
		return JSON.parse(data);
	} catch (error) {
		// If file doesn't exist or is invalid JSON, return defaults
		if (error.code === 'ENOENT') {
			console.log('Preferences file not found, using defaults.');
			// Optionally, create the file with defaults here
			try {
				await fs.writeFile(preferencesFilePath, JSON.stringify(defaultPreferences, null, 2), 'utf8');
				console.log('Created preferences file with defaults.');
			} catch (writeError) {
				console.error('Error creating preferences file:', writeError);
			}
			return defaultPreferences;
		} else {
			console.error('Error reading preferences file:', error);
			return defaultPreferences; // Fallback to defaults on other errors
		}
	}
}

// Helper function to write preferences to file
async function writePreferencesToFile(preferences) {
	try {
		await fs.writeFile(preferencesFilePath, JSON.stringify(preferences, null, 2), 'utf8');
		console.log('Updated preferences saved to file:', preferences);
	} catch (error) {
		console.error('Error writing preferences file:', error);
	}
}

// Get current preferences
exports.getPreferences = async (req, res) => {
	try {
		const preferences = await readPreferencesFromFile();
		res.status(200).json(preferences);
	} catch (error) {
		// Error handling is mostly within readPreferencesFromFile,
		// but catch any unexpected errors during the request handling.
		console.error('Error in getPreferences handler:', error);
		res.status(500).json({ message: 'Error retrieving preferences' });
	}
};

// Update preferences
exports.updatePreferences = async (req, res) => {
	try {
		let currentPreferences = await readPreferencesFromFile();
		const { filter, gridSize } = req.body;

		let updated = false;
		if (filter !== undefined && currentPreferences.filter !== filter) {
			currentPreferences.filter = filter;
			updated = true;
		}
		if (gridSize !== undefined && currentPreferences.gridSize !== gridSize) {
			currentPreferences.gridSize = gridSize;
			updated = true;
		}

		if (updated) {
			await writePreferencesToFile(currentPreferences);
			res.status(200).json({ message: 'Preferences updated successfully', preferences: currentPreferences });
		} else {
			res.status(200).json({ message: 'No changes detected in preferences', preferences: currentPreferences });
		}
	} catch (error) {
		console.error('Error in updatePreferences handler:', error);
		res.status(500).json({ message: 'Error updating preferences' });
	}
};
