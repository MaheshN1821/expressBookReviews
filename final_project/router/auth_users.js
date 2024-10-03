const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");

dotenv.config();

const userDb = {
  users: require("../model/users.json"),
  setUsers: function (data) {
    this.users = data;
  },
};

const bookDb = {
  books: require("./booksdb.js"),
  setBooks: function (data) {
    this.users = data;
  },
};

const isValid = (username) => {
  //returns boolean
  //write code to check is the username is valid
  const valid = userDb.users.find((person) => person.username === username);

  return valid;
};

const authenticatedUser = async (username, password) => {
  //returns boolean
  //write code to check if username and password match the one we have in records.
  const oldUser = userDb.users.find((person) => person.username === username);

  if (!oldUser) {
    return false;
  }

  const hashedPass = oldUser.password;
  const match = await bcrypt.compare(password, hashedPass);

  return match;
};

//only registered users can login
regd_users.post("/login", async (req, res) => {
  //Write your code here
  const { user, pwd } = req.body;

  if (!user || !pwd) {
    return res.status(400).json({ error: "username and password required!" });
  }

  if (isValid(user)) {
    const isOkay = await authenticatedUser(user, pwd);
    if (isOkay) {
      const accessToken = jwt.sign(
        { username: user },
        process.env.ACCESS_TOKEN_SEC,
        { expiresIn: "60s" }
      );
      req.headers["authorization"] = `bearer ${accessToken}`;
      res.status(200).json({ message: "Customer successfully logged in" });
    } else {
      res.status(401).json({ error: "Unauthorized!" });
    }
  } else {
    res.status(401).json({ error: "Unauthorized!" });
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const bookId = req.params.isbn;
  books[bookId].reviews = "Review Updated!";

  return res
    .status(200)
    .send(`The Review for the book with ISBN ${bookId} has been added/updated`);
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  //Write your code here
  const bookId = req.params.isbn;
  books[bookId].reviews = "";

  return res
    .status(200)
    .send(`The Review for the book with ISBN ${bookId} has been deleted`);
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
