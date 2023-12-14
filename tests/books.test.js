const {
    addBook,
    getBooks,
    deleteBook,
    patchBook,
    putBook,
} = require('../controllers/books.controllers'); // Update the path accordingly

const NodeCache = require('node-cache');

// Mocking the node-cache module
jest.mock('node-cache');
const myCache = new NodeCache();

describe('Library Functions', () => {
    let req, res, next;

    beforeEach(() => {
        req = { body: {} };
        res = {
            status: jest.fn().mockReturnThis(),
            json: jest.fn(),
        };
        next = jest.fn();
    });

    afterEach(() => {
        jest.clearAllMocks();
        myCache.flushAll(); // Clear the cache after each test
    });

    describe('addBook', () => {
        it('should add a book to the library when not cached', () => {
            myCache.has = jest.fn().mockReturnValue(false);

            req.body.book = 'New Book';
            addBook(req, res, next);

            expect(myCache.set).toHaveBeenCalledWith('books', ['New Book']);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Book added to library successfully',
            });
        });

        it('should add a book to the library when cached and book does not exist', () => {
            myCache.has = jest.fn().mockReturnValue(true);
            myCache.take = jest.fn().mockReturnValue([]);

            req.body.book = 'New Book';
            addBook(req, res, next);

            expect(myCache.set).toHaveBeenCalledWith('books', ['New Book']);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Book added to library successfully',
            });
        });

        it('should handle the case where the book already exists', () => {
            myCache.has = jest.fn().mockReturnValue(true);
            myCache.take = jest.fn().mockReturnValue(['Existing Book']);

            req.body.book = 'Existing Book';
            addBook(req, res, next);

            expect(myCache.set).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(409);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Book already exist in library!!',
            });
        });

        it('should handle errors', () => {
            jest.spyOn(console, 'log').mockImplementationOnce(() => {
                throw new Error('Test Error');
            });

            addBook(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Test Error',
            });
        });
    });

    describe('getBooks', () => {
        it('should return a list of books when the cache is not empty', () => {
            myCache.has = jest.fn().mockReturnValue(true);
            myCache.get = jest.fn().mockReturnValue(['Book1', 'Book2']);

            getBooks(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Pulled books list successfully',
                data: 'Book1;Book2',
            });
        });

        it('should return a message indicating an empty library when the cache is empty', () => {
            myCache.has = jest.fn().mockReturnValue(false);

            getBooks(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Library is empty',
            });
        });

        it('should handle errors', () => {
            jest.spyOn(console, 'log').mockImplementationOnce(() => {
                throw new Error('Test Error');
            });

            getBooks(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Test Error',
            });
        });
    });

    describe('deleteBook', () => {
        it('should delete a book from the library when the book exists', () => {
            myCache.has = jest.fn().mockReturnValue(true);
            myCache.get = jest.fn().mockReturnValue(['Book1', 'Book2']);

            req.body.book = 'Book1';
            deleteBook(req, res, next);

            expect(myCache.set).toHaveBeenCalledWith('books', ['Book2']);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Book deleted from library successfully',
            });
        });

        it('should handle the case where the book does not exist', () => {
            myCache.has = jest.fn().mockReturnValue(true);
            myCache.get = jest.fn().mockReturnValue(['Book1', 'Book2']);

            req.body.book = 'Nonexistent Book';
            deleteBook(req, res, next);

            expect(myCache.set).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Book not found in library!!',
            });
        });

        it('should handle errors', () => {
            jest.spyOn(console, 'log').mockImplementationOnce(() => {
                throw new Error('Test Error');
            });

            deleteBook(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Test Error',
            });
        });
    });

    describe('patchBook', () => {
        it('should rename a book in the library when the original book exists and the new book name is unique', () => {
            myCache.has = jest.fn().mockReturnValue(true);
            myCache.get = jest.fn().mockReturnValue(['Book1', 'Book2']);

            req.body.original_book = 'Book1';
            req.body.new_book = 'NewBook';
            patchBook(req, res, next);

            expect(myCache.set).toHaveBeenCalledWith('books', ['NewBook', 'Book2']);
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Book1 book renamed to NewBook successfully.',
            });
        });

        it('should handle the case where the original book does not exist', () => {
            myCache.has = jest.fn().mockReturnValue(true);
            myCache.get = jest.fn().mockReturnValue(['Book1', 'Book2']);

            req.body.original_book = 'Nonexistent Book';
            req.body.new_book = 'NewBook';
            patchBook(req, res, next);

            expect(myCache.set).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(404);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Nonexistent Book book not found in library!!',
            });
        });

        it('should handle the case where the new book name already exists', () => {
            myCache.has = jest.fn().mockReturnValue(true);
            myCache.get = jest.fn().mockReturnValue(['Book1', 'Book2', 'NewBook']);

            req.body.original_book = 'Book1';
            req.body.new_book = 'NewBook';
            patchBook(req, res, next);

            expect(myCache.set).not.toHaveBeenCalled();
            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Cannot rename Book1. Book with NewBook name already exists in library.',
            });
        });

        it('should handle errors', () => {
            jest.spyOn(console, 'log').mockImplementationOnce(() => {
                throw new Error('Test Error');
            });

            patchBook(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Test Error',
            });
        });
    });

    describe('putBook', () => {
        it('should save all books to the database successfully', () => {
            myCache.has = jest.fn().mockReturnValue(true);
            myCache.get = jest.fn().mockReturnValue(['Book1', 'Book2']);

            putBook(req, res, next);

            expect(res.status).toHaveBeenCalledWith(200);
            expect(res.json).toHaveBeenCalledWith({
                Book1: expect.any(String),
                Book2: expect.any(String),
            });
        });

        it('should handle the case where the library is empty', () => {
            myCache.has = jest.fn().mockReturnValue(false);

            putBook(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Library is empty!!',
            });
        });

        it('should handle errors', () => {
            jest.spyOn(console, 'log').mockImplementationOnce(() => {
                throw new Error('Test Error');
            });

            putBook(req, res, next);

            expect(res.status).toHaveBeenCalledWith(500);
            expect(res.json).toHaveBeenCalledWith({
                message: 'Test Error',
            });
        });
    });
});
