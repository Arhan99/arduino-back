const express = require("express");
const cors = require("cors"); // импорт cors middleware
const app = express();

const port = process.env.PORT || 3000;

// Использование middleware cors
app.use(cors());

app.get("/", (req, res) => {
  res.send("Arduino arduinooo 2");
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
