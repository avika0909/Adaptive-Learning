import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './ResultPage.css';

const ResultPage = ({ questions, selectedAnswers }) => {
  const navigate = useNavigate();
  const [showDetailedResult, setShowDetailedResult] = useState(false);

  console.log(questions)
  console.log(selectedAnswers)

  const correctCount = questions.reduce((count, q) => {
    const selected = selectedAnswers[q.id]?.toUpperCase();
    const correct = q.correct?.toUpperCase();
    return selected === correct ? count + 1 : count;
  }, 0);

  const handleShowResult = () => {
    setShowDetailedResult(true);
  };


  const handleTryAgain = () => {
    navigate('/');
  };

  return (
    <div className="result-container">
      <h2>🎉 Quiz Completed!</h2>
      <p className="score">Your Score: <strong>{correctCount} / {questions.length}</strong></p>

      <div className="result-buttons">
        {!showDetailedResult && (
          <button className="show-result-btn" onClick={handleShowResult}>📄 Show Result</button>
        )}
        {/* <button className="suggestion-btn" onClick={handleSuggestions}>📘 Suggestions</button> */}
        <button className="retry-btn" onClick={handleTryAgain}>🔁 Try Again</button>
      </div>
      
        <div className="next-actions">
  <div className="action-card left-card">
    <p className="suggested-topic-title">Suggested next topic</p>
    <p className="suggested-level">Suggested level</p>
    <button className="learn-btn">Start Learning</button>
  </div>

  <div className="action-card right-card">
    <p className="suggested-topic-title">Want to choose on your own?</p>
    <p className="suggested-level">Start a new journey</p>
    <button className="select-btn">Select New Topic</button>
  </div>
</div>


      {showDetailedResult && (
        <div className="detailed-results">
          <h3>📄 Your Answers:</h3>
          {questions.map((q) => {
            const selected = selectedAnswers[q.id]?.toUpperCase() || 'Not Answered';
            const correct = q.correct?.toUpperCase();

            return (
              <div key={q.id} className="question-result-card">
                <p><strong>Q{q.id}:</strong> {q.question}</p>
                <p>
                  <span className={selected === correct ? 'correct' : 'incorrect'}>
                    Your Answer: {selected}
                  </span>
                </p>
                {selected !== correct && (
                  <p className="correct-answer">✅ Correct Answer: {correct}</p>
                )}
                {q.explanation && (
                  <p><strong>🧠 Explanation:</strong> {q.explanation}</p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ResultPage;
