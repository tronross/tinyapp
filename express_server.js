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
const users = {
  aD54il: {
    id:   "aD54il",
    email: "user2@example.com",
    password: "dishwasher-funk",
  }
};

////////////////////////////////////////////
// HELPER FUNCTIONS
////////////////////////////////////////////

// generate random alphanumeric string for short-URL id and user_id
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

// check email against emails in users database
const getUserByEmail = function(regEmail) {
  for (const user in users) {
    const userEmail = users[user]['email'];
    if (userEmail === regEmail) {
      const validUser = users[user];
      return validUser;
    }
  }
  return;
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
  const user_id = req.cookies['user_id'];
  const templateVars = { 
    user: users[user_id],
    urls: urlDatabase
   };
   res.render("urls_index", templateVars);

});

// generate new shortURL id and longURL pair and add to urlDatabase on POST
app.post("/urls", (req, res) => {
  const id = genRanStr();
  urlDatabase[id] = req.body.longURL;
  const user_id = req.cookies['user_id'];
  const templateVars = { 
    id: id, 
    longURL: urlDatabase[id],
    user: users[user_id]
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
  const user_id = req.cookies['user_id'];
  const templateVars = { 
  user: users[user_id],
  urls: urlDatabase
  };
  res.render("urls_new", templateVars);
});

// render page displaying single shortURL id and longURL pair
app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const longURL = urlDatabase[shortURL];
  const user_id = req.cookies['user_id'];
  const templateVars = { 
    user: users[user_id],
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

// render form to register new user
app.get("/register", (req, res) => {
  const user_id = req.cookies['user_id'];
  const templateVars = { user: users[user_id] }
  res.render("user_register", templateVars);
});

// register new user
app.post("/register", (req, res) => {
  const userRandomID = genRanStr();
  const email = req.body.email;
  const password = req.body.password;

  if (email === '' || password === '') {
    res.status(400).send('Invalid entry');
  } else {
    const alreadyRegistered = getUserByEmail(email);
    if (!alreadyRegistered) {
      users[userRandomID] = {
        id: userRandomID,
        email,
        password
      };
      res.cookie('user_id', userRandomID);
      res.redirect("/urls");
    } else {
    res.status(400).send('Email is already registered');
    }
  }
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// launch server and set up event listener
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});