const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


const genRanStr = function() {
  const charSet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const charSetLength = charSet.length;
  let randString = '';
  
  for (let i = 0; i < 6; i++) {
    const randIndex = Math.floor(Math.random() * charSetLength);
    const randChar = charSet.charAt(randIndex);
    randString += randChar;
  }
  return randString;
};

app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/u/:id", (req, res) => {
 const longURL = req.params.id;
  res.redirect(longURL);
});

app.get("/urls", (req, res) => {
  const tempVars = { urls: urlDatabase };
  res.render("urls_index", tempVars);
});

app.post("/urls", (req, res) => {
  const id = genRanStr();
  urlDatabase[id] = req.body.longURL;
  const tempVars = { id: id, longURL: urlDatabase[id] };
  res.render("urls_show", tempVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:id", (req, res) => {
  const tempVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", tempVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});