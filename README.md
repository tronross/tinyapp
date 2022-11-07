# TinyApp Project

TinyApp is a full stack web application built with Node, Express and EJS that allows users to shorten long URLs (in the mode of bit.ly).

TinyApp allows for multiple users with their own collections of short URL <-> long URL pairs, and employs encrypted session-cookies and hashed passwords for user-registration and login. 

The app maintains objects of users and URL pairs in-memory as live working-databases. Future implementations will allow for database persistence between sessions.

## Final Product Screenshots

!["TinyApp URLs page"](https://github.com/tronross/tinyapp/blob/master/docs/TinyAppURLs.png?raw=true)
!["TinyApp edit page"](https://github.com/tronross/tinyapp/blob/master/docs/TinyAppEdit.png?raw=true)
!["TinyApp user registration page"](https://github.com/tronross/tinyapp/blob/master/docs/TinyAppReg3.png?raw=true)


## Dependencies

- Node.js
- Express
- EJS
- bcryptjs
- cookie-session

## Getting Started

- Install all dependencies (using the `npm install` command).
- Run the development web server using the `node express_server.js` command.