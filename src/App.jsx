import "./App.css";
import { BrowserRouter, Route, Routes, Navigate } from "react-router";
import MainLayout from "./layouts/MainLayout";
import Predictions from "./pages/predictions/predictions";
import WeatherReport from "./pages/WeatherReport/WeatherReport";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate replace to="/weather" />} />

          <Route path="/weather" element={<MainLayout />}>
            <Route index element={<Predictions />} />
            <Route path="predictions" element={<Predictions />} />
            <Route path="report" element={<WeatherReport />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
