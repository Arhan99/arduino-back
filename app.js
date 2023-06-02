require('dotenv').config({path: __dirname + '/.env'})
const express = require("express");
const fs = require("fs");
const bodyParser = require("body-parser");
const cors = require("cors"); // импорт cors middleware
const app = express();
const ChatGptController  = require('./controller/chatGpt.controller')

const port = process.env.PORT || 3000;

// Использование middleware cors
app.use(cors());
app.use(bodyParser.json());
let test = "x";
let bulbOn = false;
const dataDB = fs.readFileSync("./db.json", "utf-8");
// Преобразование содержимого в объект JavaScript
const jsonDataGet = JSON.parse(dataDB);

app.post("/temp", (req, res) => {
  test = req.body;
  res.status(201).json({ message: "User created successfully", data: test });

  let curJsonFileDate = JSON.parse(fs.readFileSync("./db.json", "utf-8"));
  console.log(test.result, "1");
  console.log(test.res, "2");
  console.log(test.dataTemp, "3");
  if (test.dataTemp > 10 && test.dataTemp < 50) {
    console.log("тут я запушил");
    curJsonFileDate.push(test);
  }
  curJsonFileDate = JSON.stringify(curJsonFileDate);

  fs.writeFile("./db.json", curJsonFileDate, err => {
    if (err) throw err;
    console.log("Data saved to file");
  });
});

app.get("/", (req, res) => {
  const getCurJsonFileDate = JSON.parse(fs.readFileSync("./db.json", "utf-8"));
  res.send(JSON.stringify(getCurJsonFileDate));
});

// лампочка
app.get("/bulb", (req, res) => {
  res.send({ bulbOn: !bulbOn });
});

// Обработчик POST-запроса для изменения состояния лампочки
app.post("/bulb", (req, res) => {
  // Инвертируем значение лампочки
  bulbOn = !bulbOn;
  res.send({ bulbOn: !bulbOn });
});


// справочник
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
app.post('/gpt', ChatGptController.askToChatGpt)

// пользователи
app.get("/getUsers", (req, res) => {
  const getCurJsonFileDate = JSON.parse(fs.readFileSync("./auth.json", "utf-8"));
  res.send(JSON.stringify(getCurJsonFileDate));
});

app.post("/editUsers", (req, res) => {
  const data = req.body; // Данные, полученные из POST-запроса
  // Преобразование данных в формат JSON
  const jsonData = JSON.stringify(data, null, 2);
  // Путь к файлу, который нужно перезаписать
  const filePath = './auth.json';
  // Перезапись файла
  fs.writeFile("./auth.json", jsonData, err => {
    if (err) throw err;
    console.log("Data saved to file");
  });
});
