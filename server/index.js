// Basic Express server setup
const express = require("express");
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Root route for testing server
app.get("/", (req, res) => {
  res.send("Server is running!");
});

// TODO: Implement user registration
// Students should receive user data (email, password, etc.) in req.body
// and return a success or error response
app.post("/register", (req, res) => {
  // Example: const { email, password } = req.body;
  // TODO: Add registration logic here (save user to DB, check if user exists, hash password)
  // אפשר לשמור בינתיים את הנתונים לוקלית בתוך קובץ גייסון
  res.status(501).json({ message: "Registration not implemented yet" });
});

// TODO: Implement user login
// Students should receive login data (email, password) in req.body
// and return a success or error response
app.post("/login", (req, res) => {
  // Example: const { email, password } = req.body;
  // TODO: Add login logic here (check user credentials, return token or error)
  res.status(501).json({ message: "Login not implemented yet" });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
