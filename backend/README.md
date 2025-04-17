### Step 1: Set Up Your Project

1. **Create a new directory for your project:**

   ```bash
   mkdir my-simple-backend
   cd my-simple-backend
   ```

2. **Initialize a new Node.js project:**

   ```bash
   npm init -y
   ```

3. **Install Express:**

   ```bash
   npm install express
   ```

### Step 2: Create the Backend Server

1. **Create a file named `server.js`:**

   ```bash
   touch server.js
   ```

2. **Open `server.js` in your favorite text editor and add the following code:**

   ```javascript
   const express = require('express');
   const path = require('path');

   const app = express();
   const PORT = process.env.PORT || 3000;

   // Serve static files from the "public" directory
   app.use(express.static(path.join(__dirname, 'public')));

   // Start the server
   app.listen(PORT, () => {
       console.log(`Server is running on http://localhost:${PORT}`);
   });
   ```

### Step 3: Create the Frontend Files

1. **Create a directory named `public`:**

   ```bash
   mkdir public
   ```

2. **Inside the `public` directory, create an `index.html` file:**

   ```bash
   touch public/index.html
   ```

3. **Open `index.html` and add some basic HTML content:**

   ```html
   <!DOCTYPE html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>My Simple Frontend</title>
       <link rel="stylesheet" href="styles.css">
   </head>
   <body>
       <h1>Hello, World!</h1>
       <script src="script.js"></script>
   </body>
   </html>
   ```

4. **Create a CSS file named `styles.css` in the `public` directory:**

   ```bash
   touch public/styles.css
   ```

5. **Add some basic styles to `styles.css`:**

   ```css
   body {
       font-family: Arial, sans-serif;
       text-align: center;
       margin-top: 50px;
   }
   ```

6. **Create a JavaScript file named `script.js` in the `public` directory:**

   ```bash
   touch public/script.js
   ```

7. **Add some basic JavaScript to `script.js`:**

   ```javascript
   console.log('Hello from script.js!');
   ```

### Step 4: Run Your Server

1. **Start your server by running the following command:**

   ```bash
   node server.js
   ```

2. **Open your browser and navigate to `http://localhost:3000`. You should see your frontend application displaying "Hello, World!"**

### Conclusion

You now have a simple backend server using Node.js and Express that serves a static frontend application. You can expand this setup by adding more routes, connecting to a database, or implementing APIs as needed.