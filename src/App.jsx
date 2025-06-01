import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TaskAssignmentTool from './TaskAssignmentTool';
import AboutPage from './pages/AboutPage';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';

function App({ basename }) {
  return (
    <Router basename={basename}>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/" element={<TaskAssignmentTool />} />
        <Route path="/about" element={<AboutPage />} />
      </Routes>
    </Router>
  );
}

export default App