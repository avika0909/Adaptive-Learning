import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import QuestionForm from './components/QuestionForm';
import ResultPage from './components/ResultPage'; // You need to create this

function App() {
  const [questions, setQuestions] = useState([]);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  // App.js
  const [showResults, setShowResults] = useState(false);


  return (
    <Router>
      <div className="App">
        <Routes>
          <Route
            path="/"
            element={
              <QuestionForm
                questions={questions}
                setQuestions={setQuestions}
                selectedAnswers={selectedAnswers}
                setSelectedAnswers={setSelectedAnswers}
                showResults={showResults}
                setShowResults={setShowResults}
              />
            }
          />
          <Route
            path="/result"
            element={
              <ResultPage
                questions={questions}
                selectedAnswers={selectedAnswers}
              />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;


