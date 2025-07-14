const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
    let usersWithSameName = users.filter( u => u.username === username)
    if(usersWithSameName.length > 0){
        return false
    } else {
        return true
    }
}

const authenticatedUser = (username,password)=>{ //returns boolean
    let validUsers = users.filter((u) => u.username === username && u.password === password)
    if(validUsers.length > 0){
        return true
    } else {
        return false
    }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
    const {username, password} = req.body;
    if(!username || !password){
        return res.status(404).json({message: "Error logging in: Username and password."})
    }
    if(authenticatedUser(username, password)){
        let accessToken = jwt.sign({data: username}, "access", {expiresIn: 60 * 60})

        req.session.authorization = {accessToken: accessToken , username: username}
        return res.status(200).json({message: "User successfully logged in."})
    } else {
        return res.status(208).json({message: "Invalid login. Check username and password."})
    }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.session.authorization.username;

    if(!review){
        return res.status(400).json({message:"Review cannot be empty."})
    }
    if(!books[isbn]){
        return res.status(404).json({message:"Book not found."})
    }
    if(books[isbn].reviews[username]){
        books[isbn].reviews[username] = review;
        return res.status(200).json({message: "Review updated successfully."})
    } else {
        books[isbn].reviews[username] = review;
        return res.status(201).json({ message: "Review added successfully." });
    }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.session.authorization.username;
    if(!books[isbn]){
        return res.status(404).json({message:"Book not found."})
    }
    if(books[isbn].reviews[username]){
        delete books[isbn].reviews[username];
        return res.status(200).json({message: "Review deleted successfully."})
    } else {
        return res.status(404).json({message: "Review not found for this user."})
    }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
