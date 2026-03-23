import React from 'react';
import './profile.css'; // import styles
import profileImg from '../user_profile.svg'; // import profile image

const Profile = () => {
    const user = {
        name: 'John Doe',
        email: 'john.doe@example.com'
    };

    return (
        <div className="profile-page">
            <div className="profile-container">
                <aside className="profile-sidebar">
                    <div className="profile-card">
                        <img src={profileImg} alt="Profile" className="profile-image" />
                        <h2>{user.name}</h2>
                        <p>{user.email}</p>
                    </div>
                    <nav className="profile-menu">
                        <button className="active">My Profile</button>
                        <button>Wishlist</button>
                        <button>Settings</button>
                        <button onClick={handleLogout} className="logout-button">Logout</button>
                    </nav>
                </aside>
                <section className="profile-content">
                    <div className="profile-tabs">
                        <button className="active">Personal Information</button>
                        <button>Order History</button>
                        <button>Payment Method</button>
                    </div>
                    <div className="profile-card">
                        <div className="profile-header">
                            <h2>Personal Information</h2>
                            <button>Edit</button>
                        </div>
                        <div className="profile-grid">
                            <input value={user.name} readOnly />
                            <input value={user.email} readOnly />
                            <input placeholder="Phone Number" disabled />
                            <input placeholder="Address" disabled />
                            <input placeholder="City" disabled />
                            <input placeholder="Country" disabled />
                            <input placeholder="Postal Code & Zip Code" disabled />
                            <input placeholder="State/Province" disabled />
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default Profile;