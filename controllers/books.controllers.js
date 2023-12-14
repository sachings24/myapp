"use strict";

const NodeCache = require("node-cache");
const myCache = new NodeCache();

function addBook(req, res, next) {
    try {
        console.log("Function : addbook");

        let cached = myCache.has("books");
        if (cached) {
            let booksList = myCache.take("books");
            if (booksList.indexOf(req.body.book) > -1) {
                myCache.set("books", booksList);
                res.status(409).json({
                    message: "Book already exist in library!!"
                })
            }
            else {
                booksList.push(req.body.book)
                myCache.set("books", booksList);
                console.log("Book added to library")
                res.status(200).json({
                    message: "Book added to library successfully",
                });
            }
        }
        else {
            let booksList = [];
            booksList.push(req.body.book);
            myCache.set("books", booksList);
            console.log("Book added to library");
            res.status(200).json({
                message: "Book added to library successfully",
            });
        }
    } catch (err) {
        console.log("err" + err);
        res.status(500).json({
            message: err,
        });
    }
}

function getBooks(req, res, next) {
    try {
        console.log("Function : getBooks");

        let cached = myCache.has("books");
        if (cached) {
            let booksList = myCache.get("books");

            const concatStr = getBookList(booksList, 0, (element, del) => String(element + del));
            function getBookList(list, index, callback, result = "") {
                if (index === list.length) {
                    return result;
                }
                result += callback(list[index], ";");
                return getBookList(list, index + 1, callback, result);
            }
            res.status(200).json({
                message: "Pulled books list successfully",
                data: concatStr
            });
        }
        else {
            res.status(200).json({
                message: "Library is empty",
            });
        }
    } catch (err) {
        console.log("err" + err);
        res.status(500).json({
            message: err
        });
    }
}

function deleteBook(req, res, next) {
    try {
        console.log("Function : deleteBook");

        let cached = myCache.has("books");
        if (cached) {
            let booksList = myCache.get("books");
            let bookIndex = booksList.indexOf(req.body.book);
            if (bookIndex > -1) {
                booksList.splice(bookIndex, 1);
                myCache.set("books", booksList);
                res.status(200).json({
                    message: "Book deleted from library successfully",
                });
            }
            else {
                res.status(404).json({
                    message: "Book not found in library!!"
                })
            }
        }
        else {
            res.status(500).json({
                message: "Library is empty!!",
            });
        }
    } catch (err) {
        console.log("err" + err);
        res.status(500).json({
            message: err,
        });
    }
}

function patchBook(req, res, next) {
    try {
        console.log("Function : patchBook");

        let cached = myCache.has("books");
        if (cached) {
            let booksList = myCache.get("books");
            let bookOrigBookIndex = booksList.indexOf(req.body.original_book);
            if (bookOrigBookIndex == -1) {
                res.status(404).json({
                    message: req.body.original_book + " book not found in library!!",
                });
            }
            else {
                let bookNewBookIndex = booksList.indexOf(req.body.new_book);
                if (bookNewBookIndex > -1) {
                    res.status(200).json({
                        message: "Cannot rename " + req.body.original_book + ". Book with " + req.body.new_book + " name already exists in library.",
                    });
                }
                else {
                    myCache.del("books");
                    booksList.splice(bookOrigBookIndex, 1, req.body.new_book);
                    myCache.set("books", booksList);
                    res.status(200).json({
                        message: req.body.original_book + " book renamed to " + req.body.new_book + " successfully.",
                    });
                }
            }
        }
        else {
            res.status(500).json({
                message: "Library is empty!!",
            });
        }
    } catch (err) {
        console.log("err" + err);
        res.status(500).json({
            message: err,
        });
    }
}

function putBook(req, res, next) {
    try {
        console.log("Function : putBook");

        let cached = myCache.has("books");
        if (cached) {
            let booksList = myCache.get("books");

            let respData = {};
            const start = performance.now();
            for (const book of booksList) {
                saveItemOnDatabase(book, dbsave);
            }

            function saveItemOnDatabase(name, callback) {
                console.log('Book name ' + ' ' + name);
                callback(name);
            }

            // callback function
            function dbsave(name) {
                // setInterval
                const end = performance.now();
                respData[name] = `${end - start}`;
                console.log('saved to DB');
            }
            res.status(200).json(respData);
        }
        else {
            res.status(500).json({
                message: "Library is empty!!",
            });
        }
    } catch (err) {
        console.log("err" + err);
        res.status(500).json({
            message: err,
        });
    }
}

module.exports = {
    addBook,
    getBooks,
    deleteBook,
    patchBook,
    putBook
};