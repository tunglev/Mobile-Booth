const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors'); // Import cors
const photosRoutes = require('./routes/photos');
const feedbackRoutes = require('./routes/feedback');

const settingsRoutes = require('./routes/settings');
const userPreferenceRoutes = require('./routes/userPreference'); // Import user preference routes


const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all origins
app.use(cors()); 

app.use((req, res, next) => {
    console.log(`Middleware: req: ${req}, res: ${res}`);
    next();
});

app.use(bodyParser.json())

app.use('/photos', photosRoutes);
app.use('/feedback', feedbackRoutes);

app.use('/settings', settingsRoutes);

app.use('/preferences', userPreferenceRoutes); // Use user preference routes


// Serve static files from the "client" directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Fallback to serve `index.html` for any unmatched routes (useful for SPAs)
// Replace the problematic catchall route
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});


// here goes some app.get, app.post, app.put, app.delete statements here
// OR use express.Router() and split server.js into multiple files for organization
