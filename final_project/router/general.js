const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.use(express.json({extended: true}));
public_users.use(express.urlencoded({ extended: true }));

const arrBooks = Object.values(books);

function getBooks() {
  return new Promise((resolve, reject) => {
      if (books) {
        resolve(books);
      }
      else {
        reject({status:404, message: "Books Database is Empty"});
      }
  });
}

function getBooksByISBN(isbn) {
  return new Promise((resolve, reject) => {
      let book = books[isbn];
      if (book) {
        resolve(book);
      }
      else {
        reject({status:404, message: "ISBN Not Found"});
      }
  });
}

function getBooksByAuthor(author) {
  return new Promise((resolve, reject) => {
    let booksByAuthor = arrBooks.filter(book => book.author.toLowerCase().includes(author.toLowerCase()));

    if (booksByAuthor.length > 0) {
      resolve(booksByAuthor);
    }
    else{
      reject({status:404, message: "No books by this author found"});
    }
  });
}

function getBooksByTitle(title) {
  return new Promise((resolve, reject) => {
    let booksByTitle = arrBooks.filter(book => book.title.toLowerCase().includes(title.toLowerCase()));

    if (booksByTitle.length > 0) {
      resolve(booksByTitle);
    }
    else{
      reject({status:404, message: "No books with this title found"});
    }
  });
}

public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!isValid(username)) { 
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "User successfully registred. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});    
    }
  } 
  return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/',function (req, res) { // Get the book list available in the shop with Promises
  getBooks()
    .then(
      result => res.send(result),
      error => res.status(error.status).json({message: error.message})
    );
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) { // Get book details based on ISBN with Promises
  getBooksByISBN(req.params.isbn)
    .then(
      result => res.send(result),
      error => res.status(error.status).json({message: error.message})
    );
});
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) { // Get book details based on author with Promises
  getBooksByAuthor(req.params.author)
    .then(
      result => res.send(result),
      error => res.status(error.status).json({message: error.message})
    );
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) { // Get all books based on title with Promises
  getBooksByTitle(req.params.title)
    .then(
      result => res.send(result),
      error => res.status(error.status).json({message: error.message})
    );
}); 

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  book = books[isbn];
  if (Object.keys(book["reviews"]).length > 0) {
    res.send(book["reviews"]);
  }
  else {
    return res.status(404).json({message: "This book has no reviews"});
  }
});

module.exports.general = public_users;
