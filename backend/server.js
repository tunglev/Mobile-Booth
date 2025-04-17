const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Serve static files from the "client" directory
app.use(express.static(path.join(__dirname, '../client')));

// Fallback to serve `index.html` for any unmatched routes (useful for SPAs)
// Replace the problematic catchall route
app.use((req, res) => {
    res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});