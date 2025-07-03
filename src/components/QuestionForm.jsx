import React, { useState } from 'react';
import './QuestionForm.css';
import QuestionViewer from './QuestionViewer';



const QuestionForm = ({ questions, setQuestions, selectedAnswers, setSelectedAnswers, showResults, setShowResults }) => {
  const [grade, setGrade] = useState('');
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [noOfQue, setNoOfQue] = useState(5); // default to 5 change
  // const [questions, setQuestions] = useState([]);
  // const [selectedAnswers, setSelectedAnswers] = useState({});
  // const [showResults, setShowResults] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false); // NEW: controls switching to quiz page

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { grade, topic, difficulty, noOfQue };

    try {
      const response = await fetch('http://127.0.0.1:5001/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      // console.log(data)

      const structured = [];
      for (let i = 1; i <=parseInt(noOfQue); i++) {
        structured.push({
          id: i,
          question: data[`question${i}`],
          options: {
            A: data[`option${i}A`],
            B: data[`option${i}B`],
            C: data[`option${i}C`],
            D: data[`option${i}D`]
          },
          correct: data[`answer${i}`].replace(/[0-9]/g, '').trim(),
          explanation: data[`description${i}`]
        });
      }

      // console.log(structured)

      setQuestions(structured);
      setSelectedAnswers({});
      setShowResults(false);
      setShowQuiz(true); // Switch to quiz page
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div>
      {/* App header outside form container */}
      <div className="app-header">
        <h1>💡 MindSpark – Intelligent MCQs for You</h1>
      </div>
  
      {/* Main form container below the header */}
      <div className="form-container">
        {!showQuiz ? (
          <>
            <h2>QuizIt: Your Style, Your Level</h2>
            <form onSubmit={handleSubmit}>
              {/* Grade input */}
              <label>Grade</label>
              <select value={grade} onChange={(e) => setGrade(e.target.value)}>
                <option value="">Select Grade</option>
                <option value="6">6th</option>
                <option value="7">7th</option>
                <option value="8">8th</option>
                <option value="9">9th</option>
                <option value="10">10th</option>
              </select>
  
              {/* Topic input */}
              <label>Topic</label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                placeholder="e.g. Algebra"
              />
  
              {/* Difficulty input */}
              <label>Difficulty</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="">Select Difficulty</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
              <label>Number of Questions</label>
              <input
                type="number"
                value={noOfQue}
                min="1"
                max="15"
                onChange={(e) => setNoOfQue(e.target.value)}
                placeholder="e.g. 5 "
              />

  
              <button type="submit">Generate MCQs</button>
            </form>
          </>
        ) : (
          <QuestionViewer
            questions={questions}
            selectedAnswers={selectedAnswers}
            setSelectedAnswers={setSelectedAnswers}
            showResults={showResults}
            setShowResults={setShowResults}
          />
        )}
      </div>
    </div>
  );
  
};

export default QuestionForm;
