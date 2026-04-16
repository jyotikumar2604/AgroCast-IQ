import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { LocationProvider } from "./context/LocationContext";
import Layout from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import WeatherPlanner from "./pages/WeatherPlanner";
import CropIntelligence from "./pages/CropIntelligence";
import Assistant from "./pages/Assistant";

export default function App() {
  return (
    <LocationProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="weather-planner" element={<WeatherPlanner />} />
            <Route path="crop-intelligence" element={<CropIntelligence />} />
            <Route path="assistant" element={<Assistant />} />
          </Route>
        </Routes>
      </Router>
    </LocationProvider>
  );
}