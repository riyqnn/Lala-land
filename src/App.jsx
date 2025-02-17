import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Maps from './components/Maps'
import './App.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Maps />} />
      </Routes>
    </Router>
  );
}

export default App;
