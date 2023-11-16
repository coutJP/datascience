import logo from './logo.svg';
import './App.css';
import ReadFromCsv from './ReadFromCsv/ReadFromCsv';
import Landing from './ReadFromCsv/Landing';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';



function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path="/datascience" element={<Landing />} />
          <Route path="/read" element={<ReadFromCsv />} />
        </Routes>
      </Router>
    </div>
  );
}

export default App;
