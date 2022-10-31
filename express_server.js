const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

// temp test database of urls
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// FUNCTION: generate random alphanumeric string for short-URL id
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

// buffer parser
app.use(express.urlencoded({ extended: true }));

// test code holder for root
app.get("/", (req, res) => {
  res.send("Hello!");
});

// redirect from short-URL id
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

// render list of id-longURL pairs in table form
app.get("/urls", (req, res) => {
  const tempVars = { urls: urlDatabase };
  res.render("urls_index", tempVars);
});

// generate new short_URL id and long-URL pair and add to urlDatabase on POST
app.post("/urls", (req, res) => {
  const id = genRanStr();
  urlDatabase[id] = req.body.longURL;
  const tempVars = { id: id, longURL: urlDatabase[id] };
  res.render("urls_show", tempVars);
});

// edit longURL value in database
app.post("/urls/:id", (req, res) => {
  console.log(req.params);
  const shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
});

// delete short_URL id and long-URL pair from database
app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// render form page to generate new short_URL id and long-URL pair
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// render single short_URL id and long-URL pair
app.get("/urls/:id", (req, res) => {
  const tempVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", tempVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// launch server and set up event listener
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});