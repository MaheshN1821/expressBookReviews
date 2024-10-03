const express = require("express");
const path = require("path");
const fs = require("fs").promises;
const public_users = express.Router();
const bcrypt = require("bcrypt");

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

public_users.post("/register", async (req, res) => {
  //Write your code here
  const { user, pwd } = req.body;

  if (!user || !pwd) {
    return res
      .status(401)
      .json({ error: "Username and password is required!" });
  }

  const data = Array.from(userDb.users);
  const duplicate = data.find((person) => person.username === user);

  if (duplicate) return res.sendStatus(409);

  try {
    const hashedPwd = await bcrypt.hash(pwd, 10);
    const newUser = { username: user, password: hashedPwd };

    userDb.setUsers([...userDb.users, newUser]);
    await fs.writeFile(
      path.join(__dirname, "..", "model", "users.json"),
      JSON.stringify(userDb.users)
    );
    res
      .status(200)
      .json({ message: "Customer successfully registered. Now you can Login" });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: err.message });
  }
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  //Write your code here
  const data = bookDb.books;
  if (!data) {
    return res.sendStatus(500);
  }
  return res.status(200).json({ data });
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", async function (req, res) {
  //Write your code here
  const bookId = req.params.isbn;
  const book = bookDb.books[bookId];
  if (!book) {
    return res.sendStatus(500);
  }
  return res.status(200).json({ book });
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  //Write your code here
  const author = req.params.author;
  const booksByAuthor = Object.values(bookDb.books).filter(
    (book) => book.author.toLowerCase() === author.toLowerCase()
  );

  if (!booksByAuthor) {
    return res.sendStatus(500);
  }
  return res.status(200).json({ booksByAuthor });
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  //Write your code here
  const title = req.params.title;

  const booksByTitle = Object.values(bookDb.books).filter(
    (book) => book.title.toLowerCase() === title.toLowerCase()
  );

  if (!booksByTitle) {
    return res.sendStatus(500);
  }
  return res.status(200).json({ booksByTitle });
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  //Write your code here
  const id = req.params.isbn;

  const review = bookDb.books[id].reviews;

  if (!review) {
    return res.sendStatus(500);
  }
  return res.status(200).json({ review });
});

module.exports.general = public_users;
