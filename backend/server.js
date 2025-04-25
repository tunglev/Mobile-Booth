const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const photosRoutes = require('./routes/photos');
const settingsRoutes = require('./routes/settings');

const app = express();
const PORT = process.env.PORT || 3000;

app.use((req, res, next) => {
    console.log(`Middleware: req: ${req}, res: ${res}`);
    next();
});

app.use(bodyParser.json())

app.use('/photos', photosRoutes);
app.use('/settings', settingsRoutes);

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