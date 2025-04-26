const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const photosRoutes = require('./routes/photos');


const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

app.use(bodyParser.json());

// Serve static files from the "client" directory
app.use(express.static(path.join(__dirname, '../frontend')));

// Fallback to serve `index.html` for any unmatched routes (useful for SPAs)
// Replace the problematic catchall route

// app.use((req, res) => {
//     res.sendFile(path.join(__dirname, '../frontend/index.html'));
// });

app.use('/photos/', photosRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});