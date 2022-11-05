////////////////////////////////////////////
// HELPER FUNCTIONS
////////////////////////////////////////////

// getUserByEmail: check email against emails in users database
const getUserByEmail = function(email, database) {
  for (const user in database) {
    const userEmail = database[user]['email'];
    if (userEmail === email) {
      const validUser = database[user];
      return validUser;
    }
  }
};


// genRanStr: generate random six character alphanumeric string
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


// urlsForUser: search input database and return database of shortURL-longURL pairs belonging to the input userID
const urlsForUser = function(id, database) {
  const userURLs = {};
  for (const shortUrl in database) {
    const longUrl = database[shortUrl].longURL;
    const user = database[shortUrl].userID;
    if (id === user) {
      userURLs[shortUrl] = longUrl;
    }
  }
  return userURLs;
};


module.exports = { getUserByEmail, genRanStr, urlsForUser };