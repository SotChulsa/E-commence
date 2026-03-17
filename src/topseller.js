import React, { useState } from "react";
import book from "./new-book.svg";

function TopSellers() {
  const [startIndex, setStartIndex] = useState(0);
  const visibleCount = 4;

  const books = [
    { title: "Book 1", author: "Author 1" },
    { title: "Book 2", author: "Author 2" },
    { title: "Book 3", author: "Author 3" },
    { title: "Book 4", author: "Author 4" },
    { title: "Book 5", author: "Author 5" },
    { title: "Book 6", author: "Author 6" }
  ];

  const visibleBooks = books.slice(startIndex, startIndex + visibleCount);

  const handleNext = () => {
    if (startIndex + visibleCount < books.length) {
      setStartIndex(startIndex + visibleCount);
    }
  };

  const handlePrev = () => {
    if (startIndex - visibleCount >= 0) {
      setStartIndex(startIndex - visibleCount);
    }
  };

  return (
    <div className="top-sellers-section">
      <h2>Top Sellers</h2>

      <div className="dropdown">
        <button className="dropbtn">Genre Sort By</button>
        <div className="dropdown-content">
          <a href="/#">Adventure</a>
          <a href="/#">Romance</a>
          <a href="/#">Sci-Fi</a>
          <a href="/#">Fantasy</a>
          <a href="/#">Horror</a>
          <a href="/#">Thriller</a>
          <a href="/#">Mystery</a>
        </div>
      </div>

      <div className="top-sellers-container">
        <button onClick={handlePrev}>Previous</button>

        <div className="books-wrapper">
          {visibleBooks.map((bookItem, index) => (
            <div className="book-card" key={index}>
              <img src={book} alt={bookItem.title} />
              <h3>{bookItem.title}</h3>
              <h4>Price</h4>
              <p>{bookItem.author}</p>
            </div>
          ))}
        </div>

        <button onClick={handleNext}>Next</button>
      </div>
    </div>
  );
}

export default TopSellers;