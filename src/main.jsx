import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Remove StrictMode for GitHub Pages compatibility
// This helps avoid some Content Security Policy issues
const basename = import.meta.env.MODE === 'production' ? '/guild-task-assignment' : '';
createRoot(document.getElementById('root')).render(<App />)
