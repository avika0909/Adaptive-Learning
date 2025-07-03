import React, { useState, useEffect } from 'react';
import './QuestionViewer.css';
import { useNavigate } from 'react-router-dom'; // for redirecting

const QuestionViewer = ({ questions, selectedAnswers, setSelectedAnswers, showResults, setShowResults }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds per question
  const navigate = useNavigate();

  const currentQuestion = questions[currentIndex];

  // Handle timer countdown
  useEffect(() => {
    if (showResults) return; // Stop timer if results are shown

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === 1) {
          handleNext(); // auto move to next question
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIndex, showResults]);

  // Reset timer on question change
  useEffect(() => {
    setTimeLeft(30);
  }, [currentIndex]);

  const handleOptionChange = (qid, option) => {
    setSelectedAnswers((prev) => ({
      ...prev,
      [qid]: option
    }));
  };

  const handlePrev = () => {
    if (currentIndex > 0) setCurrentIndex(currentIndex - 1);
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else if (!showResults) {
      handleSubmitAnswers(); // If at last question, submit
    }
  };

  const handleSubmitAnswers = () => {
    setShowResults(true);
    navigate('/result'); // Redirect to result page
  };

  return (
    <div className="question-card">
      <h4>{currentQuestion.id}. {currentQuestion.question}</h4>
      <div className="timer">⏳ Time Left: {timeLeft}s</div>

      {Object.entries(currentQuestion.options).map(([key, value]) => (
        <label key={key} className="option-label">
          <input
            type="radio"
            name={`question-${currentQuestion.id}`}
            value={key}
            checked={selectedAnswers[currentQuestion.id] === key}
            onChange={() => handleOptionChange(currentQuestion.id, key)}
            disabled={showResults}
          />
          {key}. {value}
        </label>
      ))}

      {showResults && (
        <div className="result-box">
          {(() => {
            const selected = selectedAnswers[currentQuestion.id]?.trim().toUpperCase();
            const correct = currentQuestion.correct?.trim().toUpperCase();

            if (!selected) {
              return <p className="skipped">⚠️ You didn't select an answer. (Correct: {correct})</p>;
            }
            if (selected === correct) {
              return <p className="correct">✅ Correct</p>;
            }
            else 
              return <p className="incorrect">❌ Incorrect (Correct: {correct})</p>;
          })()}
          <p><strong>Explanation:</strong> {currentQuestion.explanation}</p>
        </div>
      )}

      <div className="navigation-buttons">
        <button onClick={handlePrev} disabled={currentIndex === 0}>⬅ Prev</button>
        {currentIndex < questions.length - 1 ? (
          <button onClick={handleNext}>Next ➡</button>
        ) : (
          !showResults && (
            <button onClick={handleSubmitAnswers} className="submit-btn">
              ✅ Submit Answers
            </button>
          )
        )}
      </div>
    </div>
  );
};

export default QuestionViewer;
