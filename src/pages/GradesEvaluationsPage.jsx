import React from 'react';
import { gradesEvaluations } from '../data/mockData';
import { Award, FileText, Star, MessageSquare } from 'lucide-react';
import './GradesEvaluationsPage.css';

export default function GradesEvaluationsPage() {
  const { overallGrade, coordinatorRemarks, evaluations } = gradesEvaluations;

  const getScoreColor = (score) => {
    if (score >= 95) return '#10B981'; // Green
    if (score >= 90) return '#3B82F6'; // Blue
    return '#F59E0B'; // Amber
  };

  return (
    <div className="grades-container">
      <div className="page-header">
        <h1>Grades & Evaluations</h1>
        <p>Review your performance scoring and coordinator feedback.</p>
      </div>

      <div className="grades-grid">
        {/* Overall Grade Card (Left) */}
        <div className="grades-sidebar">
          <div className="grade-card overall-card">
            <Award size={40} className="grade-icon" />
            <div className="grade-info">
              <label>Overall Rating</label>
              <h2>{overallGrade}</h2>
              <span className="grade-sub">Equivalent to Excellent</span>
            </div>
          </div>

          <div className="grade-card remarks-card">
            <div className="card-title">
              <MessageSquare size={18} />
              <h4>Coordinator Remarks</h4>
            </div>
            <p className="remarks-text">"{coordinatorRemarks}"</p>
          </div>
        </div>

        {/* Detailed Scores (Right) */}
        <div className="grades-main">
          <div className="grade-card evaluation-card">
            <div className="card-title">
              <FileText size={18} />
              <h4>Performance Evaluation</h4>
            </div>
            
            <div className="evaluation-list">
              {evaluations.map((item, index) => (
                <div key={index} className="eval-item">
                  <div className="eval-left">
                    <Star size={16} className="star-icon" />
                    <span>{item.criteria}</span>
                  </div>
                  <div className="eval-right">
                    <div className="score-bar-bg">
                      <div 
                        className="score-bar-fill" 
                        style={{ 
                          width: `${item.score}%`,
                          backgroundColor: getScoreColor(item.score)
                        }}
                      ></div>
                    </div>
                    <span className="score-text" style={{ color: getScoreColor(item.score) }}>
                      {item.score}/100
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
