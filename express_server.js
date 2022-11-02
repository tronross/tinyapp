const express = require("express");
const cookieParser = require('cookie-parser')

const app = express();
app.use(cookieParser());
app.set("view engine", "ejs");

// buffer parser
app.use(express.urlencoded({ extended: true }));

const PORT = 8080; // default port 8080

////////////////////////////////////////////
// DATABASES
////////////////////////////////////////////

// temp test database of urls
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// users database
const users = {};

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



// test code holder for root
app.get("/", (req, res) => {
  res.send("Hello!");
});

////////////////////////////////////////////
// URL MANAGEMENT
////////////////////////////////////////////

// redirect from shortURL id
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

// render list of id-longURL pairs in table form
app.get("/urls", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"],
    urls: urlDatabase
   };
  res.render("urls_index", templateVars);
});

// generate new shortURL id and longURL pair and add to urlDatabase on POST
app.post("/urls", (req, res) => {
  const id = genRanStr();
  urlDatabase[id] = req.body.longURL;
  const templateVars = { 
    id: id, 
    longURL: urlDatabase[id],
    username: req.cookies["username"]
  };
  res.render("urls_show", templateVars);
});

// edit longURL value in database
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
});

// delete shortURL id and longURL key-value pair from database
app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

// render form page to generate new shortURL id and longURL pair
app.get("/urls/new", (req, res) => {
  const templateVars = { 
    username: req.cookies["username"],
    urls: urlDatabase
   };
  res.render("urls_new", templateVars);
});

// render page displaying single shortURL id and longURL pair
app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  const templateVars = { 
    username: req.cookies["username"],
    urls: urlDatabase,
    id: shortURL,
    longURL
   };
  res.render("urls_show", templateVars);
});


////////////////////////////////////////////
// USER MANAGEMENT
////////////////////////////////////////////

// assign username login cookie on login POST
app.post("/login", (req, res) => {
  const userName = req.body.username;
  res.cookie('username', userName);
  res.redirect("/urls");
});

// delete username login cookie on logout POST
app.post("/logout", (req, res) => {
  res.clearCookie('username');
  res.redirect("/urls");
});

// register new user
app.get("/register", (req, res) => {
  const templateVars = { username: req.cookies["username"] }
  res.render("user_register", templateVars);
});



app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// launch server and set up event listener
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});