const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const cors = require("cors"); // импорт cors middleware
const app = express();

const port = process.env.PORT || 3000;

// Использование middleware cors
app.use(cors());
app.use(bodyParser.json());
let test = "x";
const dataDB = fs.readFileSync('./db.json', 'utf-8');
// Преобразование содержимого в объект JavaScript
const jsonDataGet = JSON.parse(dataDB);

app.post("/users", (req, res) => {
  test = req.body;
  if (test.result > 10 && test.result < 50) {
    res.status(201).json({ message: "User created successfully", data: test });

    let curJsonFileDate = JSON.parse(fs.readFileSync('./db.json', 'utf-8'));
    curJsonFileDate.push(test)
    curJsonFileDate = JSON.stringify(curJsonFileDate);

    fs.writeFile('./db.json', curJsonFileDate, (err) => {
      if (err) throw err;
      console.log('Data saved to file');
    });
  }
});


app.get("/", (req, res) => {
  const getCurJsonFileDate = JSON.parse(fs.readFileSync('./db.json', 'utf-8'));
  res.send(JSON.stringify(getCurJsonFileDate));
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
