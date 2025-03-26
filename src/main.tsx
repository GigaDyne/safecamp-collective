
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import 'mapbox-gl/dist/mapbox-gl.css'; // Make sure this import is present

createRoot(document.getElementById("root")!).render(<App />);
