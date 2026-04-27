import React from 'react';
import { theme } from '../../styles/theme';

const CoordinatorOversightPage = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: '0 0 8px 0' }}>Coordinator Oversight</h1>
      <p style={{ color: theme.colors.textMuted, marginBottom: '24px' }}>Monitor workload and performance of OJT Coordinators.</p>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
        {[1, 2].map(i => (
          <div key={i} style={{ backgroundColor: '#fff', padding: '24px', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>C{i}</div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Prof. Coordinator {i}</h3>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>OJT Coordinator - BSIT</p>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800 }}>45</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Assigned</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#f59e0b' }}>12</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Pending</div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#10b981' }}>24h</div>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Avg. Response</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CoordinatorOversightPage;
