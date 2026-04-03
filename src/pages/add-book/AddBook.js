import React, { useState, useEffect } from 'react';
import { addBook, updateBook } from '../../api';

const AddBook = ({ setActiveView, accessToken, withTokenRefresh, showUiMessage, editBook }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [genre, setGenre] = useState('');
  const [image, setImage] = useState('');
  const [saving, setSaving] = useState(false);

  const isEditing = !!editBook;

  useEffect(() => {
    if (isEditing && editBook) {
      setTitle(editBook.title || '');
      setAuthor(editBook.author || '');
      setDescription(editBook.description || '');
      setPrice(editBook.price?.toString() || '');
      setGenre(editBook.genre || '');
      setImage(editBook.image || '');
    }
  }, [isEditing, editBook]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!title || !author || !description || !price || !genre) {
      showUiMessage('Please fill all required fields.', 'error');
      return;
    }

    const priceNum = parseFloat(price);
    if (Number.isNaN(priceNum) || priceNum <= 0) {
      showUiMessage('Please enter a valid price.', 'error');
      return;
    }

    setSaving(true);
    try {
      const bookData = {
        title,
        author,
        description,
        price: priceNum,
        genre,
        image: image || '',
      };

      if (isEditing) {
        await withTokenRefresh((token) => updateBook(token, editBook._id, bookData));
        showUiMessage('Book updated successfully!', 'success');
      } else {
        await withTokenRefresh((token) => addBook(token, bookData));
        showUiMessage('Book added successfully!', 'success');
      }

      setActiveView('admin-dashboard');
    } catch (error) {
      showUiMessage(error.message || `Could not ${isEditing ? 'update' : 'add'} book.`, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="auth-view">
      <button
        type="button"
        className="back-home-link"
        onClick={() => setActiveView('admin-dashboard')}
      >
        Back to Dashboard
      </button>

      <div className="auth-panels auth-single">
        <article className="auth-card">
          <h3>{isEditing ? 'Edit Book' : 'Add New Book'}</h3>
          <form onSubmit={handleSubmit}>
            <label>
              Title *
              <input
                type="text"
                placeholder="Enter book title"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                required
              />
            </label>
            <label>
              Author *
              <input
                type="text"
                placeholder="Enter author name"
                value={author}
                onChange={(event) => setAuthor(event.target.value)}
                required
              />
            </label>
            <label>
              Description *
              <textarea
                placeholder="Enter book description"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows="4"
                required
              />
            </label>
            <label>
              Price *
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="Enter price (e.g., 19.99)"
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                required
              />
            </label>
            <label>
              Genre *
              <select
                value={genre}
                onChange={(event) => setGenre(event.target.value)}
                required
              >
                <option value="">Select genre</option>
                <option value="Fiction">Fiction</option>
                <option value="Nonfiction">Nonfiction</option>
                <option value="Thriller">Thriller</option>
                <option value="Mystery">Mystery</option>
                <option value="Romance">Romance</option>
                <option value="Sci-Fi">Sci-Fi</option>
                <option value="Fantasy">Fantasy</option>
                <option value="Biography">Biography</option>
                <option value="History">History</option>
                <option value="Self-Help">Self-Help</option>
                <option value="Other">Other</option>
              </select>
            </label>
            <label>
              Image URL (optional)
              <input
                type="url"
                placeholder="Enter image URL"
                value={image}
                onChange={(event) => setImage(event.target.value)}
              />
            </label>
            <button type="submit" disabled={saving}>
              {saving ? (isEditing ? 'Updating Book...' : 'Adding Book...') : (isEditing ? 'Update Book' : 'Add Book')}
            </button>
          </form>
        </article>
      </div>
    </main>
  );
};

export default AddBook;