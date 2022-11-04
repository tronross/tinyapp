const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();
app.use(cookieParser());
app.set('view engine', 'ejs');

// buffer parser
app.use(express.urlencoded({ extended: true }));

const PORT = 8080; // default port


////////////////////////////////////////////
// DATABASES
////////////////////////////////////////////

// temp test database of urls
const urlDatabase = {};

// users database
const users = {};


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

//
const urlsForUser = function(id) {
  const userURLs = {};
  for (const shortUrl in urlDatabase) {
    const longUrl = urlDatabase[shortUrl].longURL;
    const user = urlDatabase[shortUrl].userID;
    if (id === user) {
      userURLs[shortUrl] = longUrl;
    }
  }
  // console.log(userURLs);
  return userURLs;
};


////////////////////////////////////////////
// Placeholder for root: redirect to login
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
  if (req.cookies['user_id']) {
    const userID = req.cookies['user_id'];
    const userURLs = urlsForUser(userID);
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
  if (req.cookies['user_id']) {
    const userID = req.cookies['user_id'];
    const userURLs = urlsForUser(userID);
  
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
  if (req.cookies['user_id']) {
    const id = genRanStr();
    const userID = req.cookies['user_id'];
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
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect('/urls');
});

// render page displaying single shortURL id and longURL pair
app.get('/urls/:id', (req, res) => {
  if (req.cookies['user_id']) {
  const shortURL = req.params.id;
  const userID = req.cookies['user_id'];
  const userURLs = urlsForUser(userID);
    
    if(userURLs[shortURL]) {
      const templateVars = {
      user: users[userID],
      urls: urlDatabase,
      id: shortURL,
      longURL: shortURL.longURL
    };
    res.render('urls_show', templateVars);
  };
} else {
  res.status(401).send('You are not authorized to access this resource. Please login or register.');
}
});

// delete shortURL id and longURL key-value pair from database
app.post('/urls/:id/delete', (req, res) => {
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});


////////////////////////////////////////////
// USER MANAGEMENT
////////////////////////////////////////////

// render form for user login; redirect to /urls if already logged in
app.get('/login', (req, res) => {
  if (req.cookies['user_id']) {
    res.redirect('/urls');
  } else {
    let user;
    const templateVars = {user};
    res.render('user_login', templateVars);
  }
});

// login user and assign cookie on successful login
app.post('/login', (req, res) => {
  const loginEmail = req.body.email;
  const loginPass = req.body.password;
  const user = getUserByEmail(loginEmail);

  if (!user) {
    res.status(403).send('This email is not associated with an account');
  } else {
    if (loginPass === user.password) {
      res.cookie('user_id', user.id);
      res.redirect('/urls');
    } else {
      res.status(403).send('Incorrect password');
    }
  }
});

// delete user_id cookie on logout POST
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});

// render form to register new user; redirect to /urls if logged in
app.get('/register', (req, res) => {
  if (req.cookies['user_id']) {
    res.redirect('/urls');
  } else {
    let user;
    const templateVars = {user};
    res.render('user_register', templateVars);
  }
});

// register new user
app.post('/register', (req, res) => {
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