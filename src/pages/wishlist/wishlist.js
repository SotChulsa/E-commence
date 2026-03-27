import React from 'react';
import './profile.css'; // import styles
import profileImg from '../user_profile.svg'; // import profile image

const Wishlist = () => {
    const user = {
        name: 'John Doe',
    };

    return (
        <div className="wishlist-page">
            <div className="wishlist-container">
                <aside className="wishlist-sidebar">
                    <div className="wishlist-card">
                        <img src={profileImg} alt="Profile" className="wishlist-image" />
                        <h2>{user.name}</h2>
                    </div>
                    <nav className="wishlist-menu">
                        <button>My Profile</button>
                    </nav>
                </aside>
                <section className="wishlist-content">
                    <div className="wishlist-tabs">
                        <button className="active">My Wishlist</button>
                    </div>
                    <div className="wishlist-card">
                        <p>Your wishlist is currently empty.</p>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default Wishlist;
