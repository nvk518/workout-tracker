import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Main from './components/Main';
import Rewards from './components/Rewards';
import History from './components/History';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/rewards" element={<Rewards />} />
        <Route path="/history" element={<History />} />
      </Routes>
    </Router>
  );
};

export default App;
