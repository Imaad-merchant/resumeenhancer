import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import ResumeEnhancer from "./pages/ResumeEnhancer";
import InternshipTracker from "./pages/InternshipTracker";
import CalendarPage from "./pages/CalendarPage";
import "./App.css";

function App() {
  return (
    <div className="app">
      <header className="app-header">
        <div className="header-left">
          <div className="logo">C</div>
          <h1>Career Toolkit</h1>
          <span className="badge">UGA Terry College</span>
        </div>
        <NavBar />
      </header>
      <Routes>
        <Route path="/" element={<ResumeEnhancer />} />
        <Route path="/tracker" element={<InternshipTracker />} />
        <Route path="/calendar" element={<CalendarPage />} />
      </Routes>
    </div>
  );
}

export default App;
