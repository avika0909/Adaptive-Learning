import React, { useState, useEffect, useRef } from 'react';
import './QuestionViewer.css';
import { useNavigate } from 'react-router-dom'; // for redirecting

const QuestionViewer = ({ questions, selectedAnswers, setSelectedAnswers, showResults, setShowResults, subject, topic, level, noOfQue }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30); // 30 seconds per question
  const [quizStartTime, setQuizStartTime] = useState(null);
  const [totalTime, setTotalTime] = useState(0);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  const currentQuestion = questions[currentIndex];

  // Start quiz timer on mount
  useEffect(() => {
    if (!quizStartTime) setQuizStartTime(Date.now());
  }, [quizStartTime]);

  // Handle timer countdown per question
  useEffect(() => {
    if (showResults) return; // Stop timer if results are shown

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev === 1) {
          handleNext(); // auto move to next question
          return 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [currentIndex, showResults]);

  // Reset timer on question change
  useEffect(() => {
    setTimeLeft(30);
  }, [currentIndex]);

  // When quiz ends, calculate total time
  useEffect(() => {
    if (showResults && quizStartTime) {
      setTotalTime(Math.round((Date.now() - quizStartTime) / 1000));
    }
  }, [showResults, quizStartTime]);

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
    // Calculate total time if not already set
    const timeSpent = quizStartTime ? Math.round((Date.now() - quizStartTime) / 1000) : 0;
    navigate('/result', {
      state: {
        questions,
        selectedAnswers,
        subject,
        topic,
        level,
        noOfQue,
        totalTime: timeSpent
      }
    });
  };

  const allAnswered = questions.every(q => selectedAnswers[q.id]);

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
