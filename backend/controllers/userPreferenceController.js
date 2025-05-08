const SQLiteUserPreferenceModel = require('../model/SQLiteUserPreferenceModel');

// Get current preferences
exports.getPreferences = async (req, res) => {
	try {
		await SQLiteUserPreferenceModel.init();
		const preferences = await SQLiteUserPreferenceModel.read();
		res.status(200).json(preferences);
	} catch (error) {
		console.error('Error in getPreferences handler:', error);
		res.status(500).json({ message: 'Error retrieving preferences' });
	}
};

// Update preferences
exports.updatePreferences = async (req, res) => {
	try {
		await SQLiteUserPreferenceModel.init();
		let currentPreferences = await SQLiteUserPreferenceModel.read();
		const { filter, gridSize, frameColor } = req.body; // Added frameColor

		const newPreferences = {};
		let updated = false;

		if (filter !== undefined && currentPreferences.filter !== filter) {
			newPreferences.filter = filter;
			updated = true;
		}
		if (gridSize !== undefined && currentPreferences.gridSize !== gridSize) {
			newPreferences.gridSize = gridSize;
			updated = true;
		}
		if (frameColor !== undefined && currentPreferences.frameColor !== frameColor) { // Added frameColor logic
			newPreferences.frameColor = frameColor;
			updated = true;
		}

		if (updated) {
			const updatedPrefs = await SQLiteUserPreferenceModel.update(newPreferences);
			res.status(200).json({ message: 'Preferences updated successfully', preferences: updatedPrefs });
		} else {
			res.status(200).json({ message: 'No changes detected in preferences', preferences: currentPreferences });
		}
	} catch (error) {
		console.error('Error in updatePreferences handler:', error);
		res.status(500).json({ message: 'Error updating preferences' });
	}
};
