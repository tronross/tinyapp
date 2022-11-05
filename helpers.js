// HELPER FUNCTIONS
// getUserByEmail: check email against emails in users database
const getUserByEmail = function(email, database) {
  for (const user in database) {
    const userEmail = database[user]['email'];
    if (userEmail === email) {
      const validUser = database[user];
      return validUser;
    }
  }
  return;
};

module.exports = { getUserByEmail };