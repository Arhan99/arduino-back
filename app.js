const express = require("express");
const cors = require("cors"); // импорт cors middleware
const app = express();

const port = process.env.PORT || 3000;

// Использование middleware cors
app.use(cors());
let test = "x";

app.get("/", (req, res) => {
  res.send(JSON.stringify(test));
});

app.post("/users", (req, res) => {
  test = req.body;
  res.status(201).json({ message: "User created successfully", data: test });
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
