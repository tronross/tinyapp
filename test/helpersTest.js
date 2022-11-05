const { assert } = require('chai');

const { getUserByEmail, urlsForUser, genRanStr } = require('../helpers.js');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const testURLs = {
  tZgHac: { longURL: 'http://openstudio.ca', userID: 'FTT2Xf' },
  ZM0MMl: { longURL: 'http://groupdiy.com', userID: 'FTT2Xf' },
  '8W7hgu': {
    longURL: 'https://developer.mozilla.org/en-US/docs/Web/API/Location',
    userID: 'FTT2Xf'
  },
  '5giUqw': {
    longURL: 'https://theworld.com/~reinhold/diceware.html',
    userID: 'zh84Mi'
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = getUserByEmail("user@example.com", testUsers);
    assert.deepEqual(user, {
      id: "userRandomID",
      email: "user@example.com",
      password: "purple-monkey-dinosaur"
    });
  });

  it('should return undefined with an invalid email as an argument', function() {
    const user = getUserByEmail("steve@example.com", testUsers);
    assert.strictEqual(user, undefined);
  });
});


describe('urlsForUser', function() {
  it("should return a user's shortURL-longURL pairs", function() {
    const urls = urlsForUser("zh84Mi", testURLs);
    assert.deepEqual(urls, { '5giUqw': 'https://theworld.com/~reinhold/diceware.html' });
  });
  
  it('should return an empty object with an invalid userID as an argument', function() {
    const urls = urlsForUser('tZgHac', testURLs);
    assert.deepEqual(urls, {});
  });
});
  

describe('genRanStr', function() {
  it("should return a six-character random alphanumeric string", function() {
    const ranStr = genRanStr();
    assert.strictEqual(ranStr.length, 6);
    console.log('Random string: ', ranStr);
  });
    
});