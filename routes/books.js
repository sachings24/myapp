var express = require('express');
var router = express.Router();
const booksControllers = require('../controllers/books.controllers.js');

router.post('/', booksControllers.addBook);
router.get('/', booksControllers.getBooks);
router.delete('/', booksControllers.deleteBook);
router.patch('/', booksControllers.patchBook);
router.put('/', booksControllers.putBook);

module.exports = router;