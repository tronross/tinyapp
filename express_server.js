const express = require('express');
const cookieSession = require('cookie-session');
const bcrypt = require('bcryptjs');
const { getUserByEmail, urlsForUser, genRanStr }  = require('./helpers');

const app = express();
app.use(cookieSession({
  name: 'session',
  keys: [ '8211cc5d-cb17-429f-8ea3-598cb6ab7816',
          'fe52593c-2e45-4eb9-83f6-3b8515ec6e44' ],

  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

app.set('view engine', 'ejs');

// buffer parser
app.use(express.urlencoded({ extended: true }));

const PORT = 8080; // default port


////////////////////////////////////////////
// DATABASES
////////////////////////////////////////////

// urls database
const urlDatabase = {};

// users database
const users = {};


////////////////////////////////////////////
// Redirect to login on root
////////////////////////////////////////////

app.get('/', (req, res) => {
  res.redirect('/login');
});


////////////////////////////////////////////
// URL MANAGEMENT
////////////////////////////////////////////

// redirect from shortURL id
app.get('/u/:id', (req, res) => {
  const shortURL = req.params.id;
  if (urlDatabase[shortURL]) {
    const longURL = urlDatabase[shortURL].longURL;
    res.redirect(longURL);
  } else {
    res.status(404).send('This TinyURL is invalid');
  }
});

// render form page to generate new shortURL id and longURL pair; redirect to login if not logged in
app.get('/urls/new', (req, res) => {
  if (req.session.user_id) {
    const userID = req.session.user_id;
    const userURLs = urlsForUser(userID, urlDatabase);
    const templateVars = {
      user: users[userID],
      urls: userURLs
    };
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

// render list of id-longURL pairs in table form
app.get('/urls', (req, res) => {
  if (req.session.user_id) {
    const userID = req.session.user_id;
    const userURLs = urlsForUser(userID, urlDatabase);
    
    const templateVars = {
      user: users[userID],
      urls: userURLs
    };
    res.render('urls_index', templateVars);
  } else {
    res.status(401).send('You are not authorized to access this resource. Please login or register.');
  }
});

// generate new shortURL id and longURL pair and add to urlDatabase if logged in; 401 if not
app.post('/urls', (req, res) => {
  if (req.session.user_id) {
    const id = genRanStr();
    const userID = req.session.user_id;
    urlDatabase[id] = {
      longURL:  req.body.longURL,
      userID
    };

    const templateVars = {
      id: id,
      longURL: urlDatabase[id].longURL,
      user: users[userID]
    };
    res.render('urls_show', templateVars);
  } else {
    res.status(401).send('You are not authorized to access this resource. Please login or register.');
  }
});

// edit longURL value in database
app.post('/urls/:id', (req, res) => {
  const shortURL = req.params.id;
  
  if (req.session.user_id) {
    // change longURL if valid entry (form value type="url")
    if (req.body.longURL !== '') {
      urlDatabase[shortURL].longURL = req.body.longURL;
      res.redirect('/urls');
    // redirect to /urls without changing longURL if edit field is blank
    } else {
      res.redirect('/urls');
    }
  } else if (urlDatabase[shortURL]) {
    res.status(401).send('You are not authorized to access this resource. Please login or register.');
  } else {
    res.status(404).send('This TinyURL is invalid');
  }
});

// render page displaying single shortURL id and longURL pair
app.get('/urls/:id', (req, res) => {
  if (req.session.user_id) {
    const shortURL = req.params.id;
    const userID = req.session.user_id;
    const userURLs = urlsForUser(userID, urlDatabase);
    
    if (userURLs[shortURL]) {
      const templateVars = {
        user: users[userID],
        urls: urlDatabase,
        id: shortURL,
        longURL: shortURL.longURL
      };
      res.render('urls_show', templateVars);
    }
  } else {
    res.status(401).send('You are not authorized to access this resource. Please login or register.');
  }
});

// delete shortURL id and longURL key-value pair from database
app.post('/urls/:id/delete', (req, res) => {
  const shortURL = req.params.id;
  if (req.session.user_id) {
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else if (urlDatabase[shortURL]) {
    res.status(401).send('You are not authorized to access this resource. Please login or register.');
  } else {
    res.status(404).send('This TinyURL is invalid');
  }
});


////////////////////////////////////////////
// USER MANAGEMENT
////////////////////////////////////////////

// render form for user login; redirect to /urls if already logged in
app.get('/login', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    let user;
    const templateVars = { user };
    res.render('user_login', templateVars);
  }
});

// login user and assign cookie on successful login
app.post('/login', (req, res) => {
  const loginEmail = req.body.email;
  const loginPass = req.body.password;
  const user = getUserByEmail(loginEmail, users);

  if (!user) {
    res.status(403).send('This email is not associated with an account');
  } else {
    const hashPass = user.hashedPassword;
    if (bcrypt.compareSync(loginPass, hashPass)) {
      req.session.user_id = user.id;
      res.redirect('/urls');
    } else {
      res.status(403).send('Incorrect password');
    }
  }
});

// delete user_id cookie on logout POST
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});

// render form to register new user; redirect to /urls if logged in
app.get('/register', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls');
  } else {
    let user;
    const templateVars = { user };
    res.render('user_register', templateVars);
  }
});

// register new user
app.post('/register', (req, res) => {
  const userRandomID = genRanStr();
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  if (email === '' || password === '') {
    res.status(400).send('Invalid entry');
  } else {
    const alreadyRegistered = getUserByEmail(email, users);
    if (!alreadyRegistered) {
      users[userRandomID] = {
        id: userRandomID,
        email,
        hashedPassword
      };
      req.session.user_id = userRandomID;
      res.redirect('/urls');
    } else {
      res.status(400).send('Email is already registered');
    }
  }
});


////////////////////////////////////////////
// json transmit and app.listen
////////////////////////////////////////////

// transmit urlDatabase as json
app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
});

// launch server and set up event listener
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});