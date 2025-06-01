import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TaskAssignmentTool from './TaskAssignmentTool';
import AboutPage from './pages/AboutPage';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import { CustomToastProvider } from './components/CustomToast';

// Try to import react-hot-toast's Toaster, but fall back gracefully if it fails
let Toast = () => null;
try {
  const { Toaster } = require('react-hot-toast');
  Toast = () => <Toaster position="top-right" />;
} catch (e) {
  console.warn("Could not load react-hot-toast, using fallback toast");
}

function App({ basename }) {
  return (
    <CustomToastProvider>
      <Router basename={basename}>
        <ScrollToTop />
        <Toast />
        <Navbar />
        <Routes>
          <Route path="/" element={<TaskAssignmentTool />} />
          <Route path="/about" element={<AboutPage />} />
        </Routes>
      </Router>
    </CustomToastProvider>
  );
}

export default App