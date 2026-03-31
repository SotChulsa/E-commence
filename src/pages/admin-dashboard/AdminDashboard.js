import React, { useMemo } from 'react';

const AdminDashboard = ({ adminStats, adminStatsLoading, adminStatsError, setActiveView }) => {
  const adminStatCards = useMemo(
    () => [
      { label: 'Total Orders', value: adminStats?.totalOrders ?? 0 },
      { label: 'New Orders', value: adminStats?.newOrders ?? 0 },
      { label: 'Delivered', value: adminStats?.deliveredOrders ?? 0 },
      { label: 'Cancelled', value: adminStats?.cancelledOrders ?? 0 },
      { label: 'Books', value: adminStats?.totalBooks ?? 0 },
      { label: 'Users', value: adminStats?.totalUsers ?? 0 },
    ],
    [adminStats]
  );

  return (
    <main className="admin-dashboard-view fade-in-anim">
      <div className="section-title-row">
        <h3>Admin Dashboard</h3>
      </div>
      <p className="section-note">Live operational snapshot from backend.</p>

      {adminStatsLoading ? <p className="section-note">Loading dashboard stats...</p> : null}
      {adminStatsError ? <p className="section-note warning">{adminStatsError}</p> : null}

      <div className="admin-stats-grid">
        {adminStatCards.map((card) => (
          <article key={card.label} className="admin-stat-card">
            <h4>{card.label}</h4>
            <p>{card.value}</p>
          </article>
        ))}
      </div>

      <div className="profile-actions">
        <button type="button" onClick={() => setActiveView('home')}>Back to Home</button>
      </div>
    </main>
  );
};

export default AdminDashboard;