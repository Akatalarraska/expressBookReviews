const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }
    if (users.find(user => user.username === username)) {
      return res.status(409).json({ message: "Username already exists." });
    }
    users.push({ username: username, password: password });
    return res.status(201).json({ message: "User successfully registered. Now you can login." });
  });

// Get the book list available in the shop
const getBooksAsync = () => {
    return new Promise((resolve, reject) => {
        setTimeout(()=>{
            resolve(books)
        },1000)
    })
}

public_users.get('/',async (req, res) => {
  try{
    const allBooks = await getBooksAsync()
    return res.status(200).json(allBooks)
  } catch(err){
    return res.status(500).json({message: "Error retrieving books."})
  }
});

// Get book details based on ISBN

const getByISBNAsync = (isbn) =>{
    return new Promise((resolve, reject) => {
        setTimeout(()=>{
            if(books[isbn]){
                resolve(books[isbn])
            }else{
                reject("Book not found")
            }
        },1000)
    })
}
public_users.get('/isbn/:isbn',async (req, res) => {
    const isbn = req.params.isbn;
    try{
        const book = await getByISBNAsync(isbn)
        return res.status(200).json(book)
    } catch(error) {
        return res.status(404).json({message: error})
    }
 });
  
// Get book details based on author
const getBooksByAuthorAsync = (author) => {
    return new Promise((resolve, reject) => {
        // Hacemos la búsqueda más robusta usando .trim()
        const booksByAuthor = Object.values(books).filter(
            (book) => book.author.toLowerCase().trim() === author.toLowerCase().trim()
        );
        
        setTimeout(() => {
            if (booksByAuthor.length > 0) {
                resolve(booksByAuthor);
            } else {
                reject("No books found by this author.");
            }
        }, 1000); 
    });
};

// Get book details based on author using async/await
public_users.get("/author/:author", async (req, res) => {
    const author = req.params.author;
    try {
        const booksFound = await getBooksByAuthorAsync(author);
        return res.status(200).json(booksFound);
    } catch (error) {
        return res.status(404).json({ message: error });
    }
})

// Get all books based on title
const getByTitleAsync = (title) => {
    return new Promise((resolve, reject) => {
        const booksByTitle = Object.values(books).filter((x)=> x.title.toLowerCase() === title.toLowerCase())
        setTimeout(()=>{
            if(booksByTitle.length > 0){
               resolve(booksByTitle) 
            } else {
                reject("No books found with this title.")
            }
        },1000)
    })
};
public_users.get('/title/:title',async (req, res) => {
    const title =  req.params.title;
    try{
        const booksFound = await getByTitleAsync(title)
        return res.status(200).json(booksFound)
    }
    catch (error){
        return res.status(404).json({message: error});
    }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    if(book){
        return res.status(200).json(book.reviews);
    } else {
        return res.status(404).json({message: "Book not found"})
    }
});

module.exports.general = public_users;
