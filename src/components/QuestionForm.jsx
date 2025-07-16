import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import './QuestionForm.css';
import QuestionViewer from './QuestionViewer';

const subjectTopics = {
  "Operating System": [
    "Process Management",
    "Threading & Concurrency",
    "CPU Scheduling",
    "Deadlocks",
    "Memory Management",
    "Paging & Segmentation",
    "Virtual Memory",
    "File System",
    "Disk Scheduling",
    "Synchronization",
    "System Calls",
    "Interprocess Communication (IPC)",
    "Banker's Algorithm",
    "Operating System Architecture",
    "I/O Management"
  ],
  "DBMS": [
    "ER Model",
    "Relational Model",
    "Normalization",
    "SQL Queries",
    "Transactions & Concurrency Control",
    "Indexing",
    "Joins",
    "ACID Properties",
    "File Organization"
  ],
  "DSA": [
    "Arrays & Strings",
    "Linked List",
    "Stacks & Queues",
    "Trees",
    "Graphs",
    "Searching & Sorting",
    "Dynamic Programming",
    "Greedy Algorithms",
    "Recursion & Backtracking"
  ],
  "CN": [
    "OSI Model",
    "TCP/IP Model",
    "IP Addressing & Subnetting",
    "Routing Algorithms",
    "Switching Techniques",
    "Application Layer Protocols",
    "Transport Layer Protocols",
    "Network Security",
    "Data Link Layer Protocols"
  ]
};

const QuestionForm = ({ questions, setQuestions, selectedAnswers, setSelectedAnswers, showResults, setShowResults }) => {
  const location = useLocation();

const autoStart = location.state?.autoStart || localStorage.getItem("autoStart") === "true";
const initialSubject = location.state?.subject || localStorage.getItem("selectedSubject") || '';
const initialTopic = location.state?.topic || localStorage.getItem("selectedTopic") || '';
const initialDifficulty = location.state?.level || localStorage.getItem("selectedLevel") || '';
const initialNoOfQue = location.state?.noOfQue || parseInt(localStorage.getItem("noOfQue")) || 5;

const [subject, setSubject] = useState(initialSubject);
const [topic, setTopic] = useState(initialTopic);
const [difficulty, setDifficulty] = useState(initialDifficulty);
const [noOfQue, setNoOfQue] = useState(initialNoOfQue);
const [showQuiz, setShowQuiz] = useState(false);

  // const location = useLocation();

useEffect(() => {
  if (autoStart && subject && topic && difficulty) {
    setTimeout(() => {
      handleSubmit({ preventDefault: () => {} });
    }, 300);
  }
}, []); // 👈 Run only once on mount


  const handleSubjectChange = (e) => {
    setSubject(e.target.value);
    setTopic('');
  };

  const handleSubmit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
  
    const payload = { subject, topic, difficulty, noOfQue };

    try {
      const response = await fetch('http://127.0.0.1:5001/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      const structured = [];
      for (let i = 1; i <= parseInt(noOfQue); i++) {
        const answerRaw = data[`answer${i}`];
        structured.push({
          id: i,
          question: data[`question${i}`],
          options: {
            A: data[`option${i}A`],
            B: data[`option${i}B`],
            C: data[`option${i}C`],
            D: data[`option${i}D`]
          },
          correct: answerRaw ? answerRaw.replace(/[0-9]/g, '').trim() : '',
          explanation: data[`description${i}`]
        });
      }

      console.log('Received questions:', structured);

      setQuestions(structured);
      setSelectedAnswers({});
      setShowResults(false);
      setShowQuiz(true); // This ensures the quiz starts immediately
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const isFormValid =
    subject &&
    topic &&
    difficulty &&
    noOfQue &&
    !isNaN(Number(noOfQue)) &&
    Number(noOfQue) > 0;

  return (
    <div>
      <div className="app-header">
        <h1>💡 MindSpark – Intelligent MCQs for You</h1>
      </div>

      <div className="form-container">
        {!showQuiz ? (
          <>
            <h2>QuizIt: Your Style, Your Level</h2>
            <form onSubmit={handleSubmit}>
              <label>Subject</label>
              <select value={subject} onChange={handleSubjectChange}>
                <option value="">Select Subject</option>
                {Object.keys(subjectTopics).map((subj) => (
                  <option key={subj} value={subj}>{subj}</option>
                ))}
              </select>

              <label>Topic</label>
              <select
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                disabled={!subject}
              >
                <option value="">Select Topic</option>
                {subject &&
                  subjectTopics[subject].map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
              </select>

              <label>Difficulty</label>
              <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
                <option value="">Select Difficulty</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>

              {/* <label>Number of Questions</label>
              <input
                type="number"
                value={noOfQue}
                min="1"
                max="15"
                onChange={(e) => setNoOfQue(e.target.value)}
                placeholder="e.g. 5"
              /> */}

              <button type="submit" disabled={!isFormValid}>
                Generate MCQs
              </button>
            </form>
          </>
        ) : (
          <QuestionViewer
            questions={questions}
            selectedAnswers={selectedAnswers}
            setSelectedAnswers={setSelectedAnswers}
            showResults={showResults}
            setShowResults={setShowResults}
            subject={subject}
            topic={topic}
            level={difficulty}
            noOfQue={noOfQue}
          />
        )}
      </div>
    </div>
  );
};

export default QuestionForm;
