import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { internshipListings } from '../../data/mockData';
import { Search, MapPin, Clock, Briefcase, Filter } from 'lucide-react';
import '../../assets/css/students/InternshipBrowsePage.css';

export default function InternshipBrowsePage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    industry: '',
    location: '',
    duration: ''
  });

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

  return (
    <div className="browse-container">
      <div className="page-header">
        <h1>Browse Internships</h1>
        <p>Find the perfect OJT placement to kickstart your career.</p>
      </div>

      {/* Search and Filter Bar */}
      <div className="filter-bar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Search by title or company..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filters-group">
          <div className="select-wrapper">
            <Briefcase size={16} className="select-icon" />
            <select 
              value={filters.industry} 
              onChange={(e) => setFilters({ ...filters, industry: e.target.value })}
            >
              <option value="">All Industries</option>
              {industries.map((ind, i) => <option key={i} value={ind}>{ind}</option>)}
            </select>
          </div>

          <div className="select-wrapper">
            <MapPin size={16} className="select-icon" />
            <select 
              value={filters.location} 
              onChange={(e) => setFilters({ ...filters, location: e.target.value })}
            >
              <option value="">All Locations</option>
              {locations.map((loc, i) => <option key={i} value={loc}>{loc}</option>)}
            </select>
          </div>

          <div className="select-wrapper">
            <Clock size={16} className="select-icon" />
            <select 
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
      <div className="results-count">
        <p>Found <strong>{filteredListings.length}</strong> available positions</p>
      </div>

      {/* Grid of Cards */}
      <div className="internship-grid">
        {filteredListings.length === 0 ? (
          <div className="empty-results">
            <Filter size={40} className="empty-icon" />
            <h3>No internships found</h3>
            <p>Try adjusting your search queries or filters.</p>
          </div>
        ) : (
          filteredListings.map(job => (
            <div 
              key={job.id} 
              className="internship-card"
              onClick={() => navigate(`/internships/${job.id}`)}
            >
              <div className="card-top">
                <span className="industry-tag">{job.industry}</span>
                <span className="slots-tag">{job.slots} slots left</span>
              </div>
              
              <div className="card-body">
                <h3>{job.title}</h3>
                <h4 className="company-name">{job.company}</h4>
                <p className="description-preview">{job.description.substring(0, 100)}...</p>
              </div>

              <div className="card-footer">
                <div className="footer-item">
                  <MapPin size={14} />
                  <span>{job.location}</span>
                </div>
                <div className="footer-item">
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
