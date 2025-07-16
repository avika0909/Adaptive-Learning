import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ResultPage.css';

// You can import subjectTopics from QuestionForm if exported, or copy here:
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

const ResultPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { questions = [], selectedAnswers = {}, subject, topic, level, noOfQue, totalTime = 0 } = location.state || {};
  const [showDetailedResult, setShowDetailedResult] = useState(false);

  // State for prediction
  const [predicted, setPredicted] = useState(null);

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newLevel, setNewLevel] = useState('');
  const [modalError, setModalError] = useState('');

  // Calculate accuracy and time
  const correctCount = questions.reduce((count, q) => {
    const selected = selectedAnswers[q.id]?.toUpperCase();
    const correct = q.correct?.toUpperCase();
    return selected === correct ? count + 1 : count;
  }, 0);

  const accuracy = questions.length > 0 ? (correctCount / questions.length) : 0;
  // For demo, use totalTime if passed, else 30s per question
  const totalTimeTaken = totalTime || (questions.length * 30);
  const avgTimePerQuestion = questions.length > 0 ? (totalTimeTaken / questions.length) : 0;

  // Call backend for prediction
  useEffect(() => {
    if (!subject || !topic || !level) return;
    fetch('http://127.0.0.1:5001/predict', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        Subject: subject,
        Topic: topic,
        Level: level,
        Accuracy: accuracy,
        Time: avgTimePerQuestion
      })
    })
      .then(res => res.json())
      .then(data => setPredicted(data))
      .catch(e => setPredicted({ error: 'Prediction failed' }));
  }, [subject, topic, level, accuracy, avgTimePerQuestion]);

  const handleShowResult = () => setShowDetailedResult(true);

  // const handleTryAgain = () => navigate('/');

  // Start learning with predicted values
  const handleStartLearning = () => {
    if (!predicted) return;
    navigate('/', {
      state: {
        autoStart: true,
        subject: predicted.New_Subject,
        topic: predicted.New_Topic,
        level: predicted.New_Level,
        noOfQue: noOfQue
      }
    });
    
  };
  

  // Open modal
  const handleOpenModal = () => {
    setShowModal(true);
    setNewSubject('');
    setNewTopic('');
    setNewLevel('');
    setModalError('');
  };

  // Close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setModalError('');
  };

  // Handle modal submit
  const handleModalSubmit = async (e) => {
    e.preventDefault();
    
    if (!newSubject || !newTopic || !newLevel) {
      setModalError('Please fill all fields.');
      return;
    }

    // Prepare feedback data
    const feedbackData = {
      Subject: subject,
      Topic: topic,
      Level: level,
      Accuracy: accuracy*100,
      Time: avgTimePerQuestion,
      New_Subject: newSubject,
      New_Topic: newTopic,
      New_Level: newLevel
    };

    try {
      await fetch('http://127.0.0.1:5001/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackData)
      });
      // After feedback, go to QuestionForm with new values filled
      navigate('/', {
        state: {
          autoStart: false,
          subject: newSubject,
          topic: newTopic,
          level: newLevel,
          // noOfQue: noOfQue
        }
      });
    } catch (err) {
      setModalError('Failed to send feedback.');
    }
  };

  return (
    <div className="result-container">
      <h2>🎉 Quiz Completed!</h2>
      <p className="score">Your Score: <strong>{correctCount} / {questions.length}</strong></p>
      <div>
        {/* <p><strong>Subject:</strong> {subject}</p>
        <p><strong>Topic:</strong> {topic}</p>
        <p><strong>Difficulty:</strong> {level}</p>
        <p><strong>No. of Questions:</strong> {noOfQue}</p> */}
        <p><strong>Accuracy:</strong> {(accuracy * 100).toFixed(1)}%</p>
        <p><strong>Avg Time per Question:</strong> {avgTimePerQuestion.toFixed(1)}s</p>
      </div>

      {/* Show predicted values */}
      {predicted && !predicted.error && (
        <div className="predicted-box">
          {/* <h4>🔮 Predicted Next Learning Path</h4>
          <p><strong>Subject:</strong> {predicted.New_Subject}</p>
          <p><strong>Topic:</strong> {predicted.New_Topic}</p>
          <p><strong>Level:</strong> {predicted.New_Level}</p> */}
        </div>
      )}
      {predicted && predicted.error && (
        <div className="predicted-box error">
          <p>{predicted.error}</p>
        </div>
      )}

      <div className="result-buttons">
        {!showDetailedResult && (
          <button className="show-result-btn" onClick={handleShowResult}>📄 Show Result</button>
        )}
        {/* <button className="retry-btn" onClick={handleTryAgain}>🔁 Try Again</button> */}
      </div>
      
      <div className="next-actions">
        <div className="action-card left-card">
          <p className="suggested-topic-title">Suggested next topic</p>
          <p className="suggested-level">
            {predicted
              ? `${predicted.New_Topic || ''}, ${predicted.New_Subject || ''} (${predicted.New_Level || ''})`
              : 'Loading...'}
          </p>
          <button
            className="learn-btn"
            onClick={handleStartLearning}
            disabled={!predicted || predicted.error}
          >
            Start Learning
          </button>
        </div>
        <div className="action-card right-card">
          <p className="suggested-topic-title">Want to choose on your own?</p>
          <p className="suggested-level">Start a new journey</p>
          <button className="select-btn" onClick={handleOpenModal}>Select New Topic</button>
        </div>
      </div>

      {/* Modal for selecting new topic */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Select New Topic</h3>
            <form onSubmit={handleModalSubmit}>
              <label>Subject</label>
              <select
                value={newSubject}
                onChange={e => {
                  setNewSubject(e.target.value);
                  setNewTopic('');
                }}
              >
                <option value="">Select Subject</option>
                {Object.keys(subjectTopics).map(subj => (
                  <option key={subj} value={subj}>{subj}</option>
                ))}
              </select>

              <label>Topic</label>
              <select
                value={newTopic}
                onChange={e => setNewTopic(e.target.value)}
                disabled={!newSubject}
              >
                <option value="">Select Topic</option>
                {newSubject &&
                  subjectTopics[newSubject].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
              </select>

              <label>Difficulty</label>
              <select
                value={newLevel}
                onChange={e => setNewLevel(e.target.value)}
              >
                <option value="">Select Difficulty</option>
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>

              {modalError && <div className="modal-error">{modalError}</div>}

              <div className="modal-actions">
                <button type="button" onClick={handleCloseModal}>Cancel</button>
                <button
                  type="submit"
                  disabled={!newSubject || !newTopic || !newLevel}
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
