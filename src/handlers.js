const { nanoid } = require('nanoid');
const books = require('./books');

const addBookHandler = (request, h) => {
  const { name, pageCount, readPage } = request.payload;

  if (!name) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal menambahkan buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }

  if (pageCount < readPage) {
    const response = h.response({
      status: 'fail',
      message:
        'Gagal menambahkan buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  const id = nanoid(16);
  const finished = pageCount === readPage;
  const insertedAt = new Date().toISOString();
  const updatedAt = insertedAt;

  const newBook = {
    id,
    finished,
    insertedAt,
    updatedAt,
    ...request.payload,
  };

  books.push(newBook);

  const isSuccess = books.filter((book) => book.id === id).length > 0;

  if (isSuccess) {
    const response = h.response({
      status: 'success',
      message: 'Buku berhasil ditambahkan',
      data: {
        bookId: id,
      },
    });
    response.code(201);
    return response;
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku gagal ditambahkan',
  });
  response.code(500);
  return response;
};

const getAllBooksHandler = (request) => {
  const { name, reading, finished } = request.query;

  let finalBooks = books;

  if (name) {
    finalBooks = finalBooks.filter((book) =>
      book.name.toLowerCase().includes(name.toLowerCase())
    );
  }

  if (['0', '1'].includes(reading)) {
    finalBooks = finalBooks.filter((book) =>
      reading === '1' ? book.reading : !book.reading
    );
  }

  if (['0', '1'].includes(finished)) {
    finalBooks = finalBooks.filter((book) =>
      finished === '1' ? book.finished : !book.finished
    );
  }

  finalBooks = finalBooks.map(({ id, name: bookName, publisher }) => ({
    id,
    name: bookName,
    publisher,
  }));

  return {
    status: 'success',
    data: {
      books: finalBooks,
    },
  };
};

const getBookByIdHandler = (request, h) => {
  const { id } = request.params;

  const book = books.find((b) => b.id === id);

  if (book === undefined) {
    const response = h.response({
      status: 'fail',
      message: 'Buku tidak ditemukan',
    });
    response.code(404);
    return response;
  }

  return {
    status: 'success',
    data: {
      book,
    },
  };
};

const updateBookByIdHandler = (request, h) => {
  const { name, pageCount, readPage } = request.payload;

  if (!name) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Mohon isi nama buku',
    });
    response.code(400);
    return response;
  }

  if (pageCount < readPage) {
    const response = h.response({
      status: 'fail',
      message:
        'Gagal memperbarui buku. readPage tidak boleh lebih besar dari pageCount',
    });
    response.code(400);
    return response;
  }

  const { id } = request.params;

  const bookIndex = books.findIndex((book) => book.id === id);

  if (bookIndex === -1) {
    const response = h.response({
      status: 'fail',
      message: 'Gagal memperbarui buku. Id tidak ditemukan',
    });
    response.code(404);
    return response;
  }

  const updatedAt = new Date().toISOString();

  books[bookIndex] = {
    ...books[bookIndex],
    ...request.payload,
    updatedAt,
  };

  return {
    status: 'success',
    message: 'Buku berhasil diperbarui',
  };
};

const deleteBookByIdHandler = (request, h) => {
  const { id } = request.params;

  const bookIndex = books.findIndex((book) => book.id === id);

  if (bookIndex === -1) {
    const response = h.response({
      status: 'fail',
      message: 'Buku gagal dihapus. Id tidak ditemukan',
    });
    response.code(404);
    return response;
  }

  books.splice(bookIndex, 1);

  const isSuccess = books.find((book) => book.id === id) === undefined;

  if (isSuccess) {
    return {
      status: 'success',
      message: 'Buku berhasil dihapus',
    };
  }

  const response = h.response({
    status: 'fail',
    message: 'Buku gagal dihapus',
  });
  response.status(500);
  return response;
};

module.exports = {
  addBookHandler,
  getAllBooksHandler,
  getBookByIdHandler,
  updateBookByIdHandler,
  deleteBookByIdHandler,
};
