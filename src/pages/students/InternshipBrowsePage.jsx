import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { internshipListings } from '../../data/mockData';
import { Search, MapPin, Clock, Briefcase, Filter } from 'lucide-react';
import { theme } from '../../styles/theme';
import { commonStyles } from '../../styles/commonStyles';
import { useMediaQuery } from '../../hooks/useMediaQuery';

export default function InternshipBrowsePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    industry: '',
    location: '',
    duration: ''
  });
  const [hoveredCard, setHoveredCard] = useState(null);

  const isDesktop = useMediaQuery('(min-width: 1025px)');
  const isMobile = useMediaQuery('(max-width: 640px)');
  const isTablet = useMediaQuery('(max-width: 1024px)');

  // Extract unique filter options from mock data
  const industries = [...new Set(internshipListings.map(item => item.industry))];
  const locations = [...new Set(internshipListings.map(item => item.location.split(',')[1]?.trim() || item.location))];

  // Filtering Logic
  const filteredListings = internshipListings.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          job.company.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesIndustry = filters.industry === '' || job.industry === filters.industry;
    const matchesLocation = filters.location === '' || job.location.includes(filters.location);
    const matchesDuration = filters.duration === '' || job.duration.includes(filters.duration);

    return matchesSearch && matchesIndustry && matchesLocation && matchesDuration;
  });

  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      padding: '0 1rem 1rem 1rem', // Removed top padding
    },
    pageHeader: {
      marginBottom: '1rem',
      h1: {
        fontSize: '2rem',
        fontWeight: 700,
        color: theme.colors.textMain,
        margin: '0 0 0.5rem 0',
      },
      p: {
        fontSize: '1rem',
        color: theme.colors.textMuted,
        margin: 0,
      }
    },
    filterBar: {
      display: 'flex',
      flexDirection: isTablet ? 'column' : 'row',
      gap: '16px',
      backgroundColor: theme.colors.bgPrimary,
      padding: '16px',
      borderRadius: '12px',
      boxShadow: theme.shadows.sm,
      border: `1px solid ${theme.colors.border}`,
    },
    searchBox: {
      flex: 1,
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
    },
    searchIcon: {
      position: 'absolute',
      left: '12px',
      color: '#94A3B8',
    },
    searchInput: {
      width: '100%',
      padding: '10px 12px 10px 40px',
      borderRadius: '8px',
      border: `1px solid ${theme.colors.border}`,
      fontSize: '14px',
      outline: 'none',
    },
    filtersGroup: {
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'row',
      gap: '12px',
    },
    selectWrapper: {
      position: 'relative',
      display: 'flex',
      alignItems: 'center',
    },
    selectIcon: {
      position: 'absolute',
      left: '12px',
      color: '#64748B',
      pointerEvents: 'none',
    },
    select: {
      padding: '10px 32px 10px 36px',
      borderRadius: '8px',
      border: `1px solid ${theme.colors.border}`,
      fontSize: '14px',
      backgroundColor: theme.colors.bgPrimary,
      cursor: 'pointer',
      appearance: 'none',
      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748B' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'right 12px center',
      backgroundSize: '14px',
      minWidth: isMobile ? '100%' : '160px',
    },
    resultsCount: {
      fontSize: '14px',
      color: theme.colors.textMain,
    },
    internshipGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
      gap: '24px',
    },
    card: (isHovered) => ({
      backgroundColor: theme.colors.bgPrimary,
      borderRadius: '16px',
      border: `1px solid ${isHovered ? theme.colors.primary : theme.colors.border}`,
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      gap: '16px',
      cursor: 'pointer',
      transition: theme.transitions.default,
      boxShadow: isHovered ? theme.shadows.md : theme.shadows.sm,
      transform: isHovered ? 'translateY(-4px)' : 'none',
    }),
    cardTop: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    industryTag: {
      fontSize: '11px',
      fontWeight: 600,
      backgroundColor: theme.colors.bgAccent,
      color: theme.colors.primary,
      padding: '4px 10px',
      borderRadius: '12px',
    },
    slotsTag: {
      fontSize: '11px',
      color: '#059669',
      backgroundColor: '#ECFDF5',
      padding: '4px 10px',
      borderRadius: '12px',
      fontWeight: 500,
    },
    cardBody: {
      h3: {
        fontSize: '16px',
        color: theme.colors.textMain,
        margin: '0 0 4px 0',
      },
      company: {
        fontSize: '14px',
        fontWeight: 500,
        color: theme.colors.textMuted,
        margin: '0 0 12px 0',
      },
      description: {
        fontSize: '13px',
        color: '#64748B',
        lineHeight: 1.5,
        margin: 0,
      }
    },
    cardFooter: {
      display: 'flex',
      gap: '16px',
      borderTop: `1px solid ${theme.colors.border}`,
      paddingTop: '12px',
      fontSize: '12px',
      color: theme.colors.textMuted,
    },
    footerItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '4px',
    },
    emptyResults: {
      gridColumn: '1 / -1',
      textAlign: 'center',
      padding: '40px',
      color: theme.colors.textMuted,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px',
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.pageHeader}>
        <h1 style={styles.pageHeader.h1}>Browse Internships</h1>
        <p style={styles.pageHeader.p}>Find the perfect OJT placement to kickstart your career.</p>
      </div>

      {/* Search and Filter Bar */}
      <div style={styles.filterBar}>
        <div style={styles.searchBox}>
          <Search size={18} style={styles.searchIcon} />
          <input 
            type="text" 
            placeholder="Search by title or company..." 
            style={styles.searchInput}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div style={styles.filtersGroup}>
          <div style={styles.selectWrapper}>
            <Briefcase size={16} style={styles.selectIcon} />
            <select 
              style={styles.select}
              value={filters.industry} 
              onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
            >
              <option value="">All Industries</option>
              {industries.map((ind, i) => <option key={i} value={ind}>{ind}</option>)}
            </select>
          </div>

          <div style={styles.selectWrapper}>
            <MapPin size={16} style={styles.selectIcon} />
            <select 
              style={styles.select}
              value={filters.location} 
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            >
              <option value="">All Locations</option>
              {locations.map((loc, i) => <option key={i} value={loc}>{loc}</option>)}
            </select>
          </div>

          <div style={styles.selectWrapper}>
            <Clock size={16} style={styles.selectIcon} />
            <select 
              style={styles.select}
              value={filters.duration} 
              onChange={(e) => setFilters({ ...filters, duration: e.target.value })}
            >
              <option value="">All Durations</option>
              <option value="3 months">3 Months</option>
              <option value="4 months">4 Months</option>
              <option value="5 months">5 Months</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div style={styles.resultsCount}>
        <p>Found <strong>{filteredListings.length}</strong> available positions</p>
      </div>

      {/* Grid of Cards */}
      <div style={styles.internshipGrid}>
        {filteredListings.length === 0 ? (
          <div style={styles.emptyResults}>
            <Filter size={40} style={{ color: '#CBD5E1' }} />
            <h3 style={{ margin: '8px 0 0 0' }}>No internships found</h3>
            <p style={{ margin: 0 }}>Try adjusting your search queries or filters.</p>
          </div>
        ) : (
          filteredListings.map(job => (
            <div 
              key={job.id} 
              style={styles.card(hoveredCard === job.id)}
              onMouseEnter={() => setHoveredCard(job.id)}
              onMouseLeave={() => setHoveredCard(null)}
              onClick={() => navigate(`/internships/${job.id}`)}
            >
              <div style={styles.cardTop}>
                <span style={styles.industryTag}>{job.industry}</span>
                <span style={styles.slotsTag}>{job.slots} slots left</span>
              </div>
              
              <div style={styles.cardBody}>
                <h3 style={styles.cardBody.h3}>{job.title}</h3>
                <h4 style={styles.cardBody.company}>{job.company}</h4>
                <p style={styles.cardBody.description}>{job.description.substring(0, 100)}...</p>
              </div>

              <div style={styles.cardFooter}>
                <div style={styles.footerItem}>
                  <MapPin size={14} />
                  <span>{job.location}</span>
                </div>
                <div style={styles.footerItem}>
                  <Clock size={14} />
                  <span>{job.duration}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
