import { Navigate, Route, Routes } from 'react-router-dom';
import Home from './pages/Home.jsx';
import Admin from './pages/Admin.jsx';
import { IS_STATIC } from './asset.js';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {/* El panel admin necesita el servidor Express: no existe en GitHub Pages */}
      {!IS_STATIC && <Route path="/admin" element={<Admin />} />}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
