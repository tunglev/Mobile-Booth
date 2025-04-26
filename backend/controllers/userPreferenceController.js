let preferences = {
    filter: 'none', // Default filter
    gridSize: 'medium' // Default grid size
};

// Get current preferences
exports.getPreferences = (req, res) => {
    res.status(200).json(preferences);
};

// Update preferences
exports.updatePreferences = (req, res) => {
    const { filter, gridSize } = req.body;

    if (filter !== undefined) {
        preferences.filter = filter;
    }
    if (gridSize !== undefined) {
        preferences.gridSize = gridSize;
    }

    // In a real app, you might save this to a file or database
    console.log('Updated preferences:', preferences); 

    res.status(200).json({ message: 'Preferences updated successfully', preferences });
};
