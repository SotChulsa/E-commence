import React, { useState, useEffect } from 'react';
import { addBook, updateBook } from '../../api';
import './AddBook.css';

const FEATURE_TAG_OPTIONS = [
  { key: 'trending', label: 'Trending' },
  { key: 'topSeller', label: 'Top Seller' },
  { key: 'bestSeller', label: 'Best Seller' },
  { key: 'recommended', label: 'Recommended For You' },
  { key: 'newArrival', label: 'New Arrival' },
];

const AddBook = ({ setActiveView, accessToken, withTokenRefresh, showUiMessage, editBook }) => {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [genre, setGenre] = useState('');
  const [image, setImage] = useState('');
  const [featureTags, setFeatureTags] = useState([]);
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
      setFeatureTags(Array.isArray(editBook.featureTags) ? editBook.featureTags : []);
    }
  }, [isEditing, editBook]);

  const toggleFeatureTag = (tag) => {
    setFeatureTags((current) => (
      current.includes(tag) ? [] : [tag]
    ));
  };

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
        featureTags,
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
    <main className="add-book-view fade-in-anim">
      <div className="add-book-head">
        <div>
          <h2>{isEditing ? 'Edit Book' : 'Add New Book'}</h2>
          <p>Create a new catalog entry with image URL, pricing, and details.</p>
        </div>
        <button
          type="button"
          className="add-book-back-btn"
          onClick={() => setActiveView('admin-dashboard')}
        >
          Back to Dashboard
        </button>
      </div>

      <form className="add-book-form" onSubmit={handleSubmit}>
        <div className="add-book-grid">
          <label>
            <span>Title *</span>
            <input
              type="text"
              placeholder="Enter book title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              required
            />
          </label>

          <label>
            <span>Author *</span>
            <input
              type="text"
              placeholder="Enter author name"
              value={author}
              onChange={(event) => setAuthor(event.target.value)}
              required
            />
          </label>

          <label>
            <span>Price *</span>
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
            <span>Genre *</span>
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

          <label className="full-width">
            <span>Description *</span>
            <textarea
              placeholder="Enter book description"
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows="4"
              required
            />
          </label>

          <label className="full-width">
            <span>Image URL</span>
            <input
              type="url"
              placeholder="https://example.com/book-cover.jpg"
              value={image}
              onChange={(event) => setImage(event.target.value)}
            />
          </label>

          <div className="full-width feature-tags-block">
            <span>Homepage Placement</span>
            <div className="feature-tags-grid">
              {FEATURE_TAG_OPTIONS.map((option) => {
                const isChecked = featureTags.includes(option.key);
                return (
                  <label key={option.key} className={`feature-tag-item ${isChecked ? 'active' : ''}`}>
                    <input
                      type="radio"
                      name="homepagePlacement"
                      checked={isChecked}
                      onChange={() => toggleFeatureTag(option.key)}
                    />
                    <span>{option.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <div className="add-book-preview-row">
          <div className="add-book-preview-card">
            {image ? (
              <img src={image} alt="Book preview" onError={(event) => { event.currentTarget.style.display = 'none'; }} />
            ) : (
              <div className="add-book-preview-empty">Image preview</div>
            )}
          </div>
          <p>Tip: Paste any public image URL to use it as the book cover.</p>
        </div>

        <div className="add-book-actions">
          <button type="button" className="secondary" onClick={() => setActiveView('admin-dashboard')}>
            Cancel
          </button>
          <button type="submit" disabled={saving}>
            {saving ? (isEditing ? 'Updating Book...' : 'Adding Book...') : (isEditing ? 'Update Book' : 'Add Book')}
          </button>
        </div>
      </form>
    </main>
  );
};

export default AddBook;