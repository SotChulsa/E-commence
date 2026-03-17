import './App.css'; 
import profile from './profile.svg'; 
import heart from './heart.svg';
import cart from './cart.svg';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <link rel="preconnect" href="https://fonts.googleapis.com"></link>
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin></link>
        <link href="https://fonts.googleapis.com/css2?family=Irish+Grover&family=Roboto:ital,wght@0,100..900;1,100..900&display=swap" rel="stylesheet"></link>
        <h1>DigiPaper</h1>
        <div class="search-container">
          <input type="text" placeholder="What are you looking for?"></input>
        </div>
        <div class="buttons-container">
          <img src={profile} alt="Profile"></img>
          <img src={heart} alt="Wishlist"></img>
          <img src={cart} alt="Cart"></img>
        </div>
      </header>
    </div>
  );
}

export default App;
