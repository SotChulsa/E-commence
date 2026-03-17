import './App.css'; 
import profile from './profile.svg'; 
import heart from './heart.svg';
import cart from './cart.svg';
import book from './new-book.svg';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <link rel="preconnect" href="https://fonts.googleapis.com"></link>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin></link>
        <link href="https://fonts.googleapis.com/css2?family=Irish+Grover&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet"></link>
        <h1>DigiPaper</h1>
        <div className="search-container">
          <input type="text" placeholder="What are you looking for?"></input>
        </div>
      <div className="buttons-container">
          <a href="/Login/login.js">
      <img src={profile} alt="Profile"/>
          </a>
          <a href="/#">
            <img src={heart} alt="Wishlist"/>
          </a>
          <a href="/#">
            <img src={cart} alt="Cart"/>
            <p>Cart</p>
          </a>
        </div>
      </header>
      <div className="trending-section">
        <h2>Trending Now</h2>
        <div className="trending-container">
        <img src={book} alt="Trending"/>
        <h2>Overview</h2>
        <p>In the contested borderlands between Mexico and the United States, a woman flees into the desert after a devastating raid on her dead husband’s ranch. 
          A lieutenant colonel in service to the fledgling Republica, sent in pursuit of cattle rustlers, discovers he’s on the trail of a more dramatic abduction. Decades later, with political ambitions on the line, the American and Mexican militaries try to maneuver Geronimo, the most legendary of Apache warriors, into surrender. 
          In our own day, a family travels through the region in search of a truer version of the past.<br></br><br></br>
          Orchestrated with a stunningly imagined cast of characters, both historical and purely fictional, their storylines playing out in multiple eras, 
          Now I Surrender is Álvaro Enrigue’s most expansive and impassioned novel yet.
          Part epic, part alt-Western, it weaves past and present, myth and history, 
          into a searing elegy for a way of life that was an incarnation of true liberty—and an homage to the spark in us that still thrills to its memory.
        </p>
      </div>
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
          <div className="book-card">
            <img src={book} alt="Book 1"/>
            <h3>Book Title 1</h3>
            <h4>Price</h4>
            <p>Author Name 1</p>
          </div>
          <div className="book-card">
            <img src={book} alt="Book 2"/>
            <h3>Book Title 2</h3>
            <h4>Price</h4>
            <p>Author Name 2</p>
          </div>
          <div className="book-card">
            <img src={book} alt="Book 3"/>
            <h3>Book Title 3</h3>
            <h4>Price</h4>
            <p>Author Name 3</p>
          </div>
          <div className="book-card">
            <img src={book} alt="Book 4"/>
            <h3>Book Title 4</h3>
            <h4>Price</h4>
            <p>Author Name 4</p>
          </div>
          </div>
      </div>
    <div className="Recommanded-section">
      <h2>Recommanded For You</h2>
      <div className="Recommanded-container">
        <div className="book-card">
          <img src={book} alt="Book 1"/>
          <h3>Book Title 1</h3>
          <h4>Price</h4>
          <p>Author Name 1</p>
        </div>
        <div className="book-card">
          <img src={book} alt="Book 2"/>
          <h3>Book Title 2</h3>
          <h4>Price</h4>
          <p>Author Name 2</p>
        </div>
        <div className="book-card">
          <img src={book} alt="Book 3"/>
          <h3>Book Title 3</h3>
          <h4>Price</h4>
          <p>Author Name 3</p>
        </div>
        <div className="book-card">
          <img src={book} alt="Book 4"/>
          <h3>Book Title 4</h3>
          <h4>Price</h4>
          <p>Author Name 4</p>
        </div>
      </div>
    </div>
  </div>
  <div className="footer">
    <p>&copy; 2026 DigiPaper. All rights reserved.</p>
  </div>
</div>
  );
}

export default App;
