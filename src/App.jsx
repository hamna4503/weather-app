import "./App.css";
import { BrowserRouter, Route, Routes, Navigate } from "react-router";
import MainLayout from "./layouts/MainLayout";
import Predictions from "./pages/predictions/predictions";
import WeatherReport from "./pages/WeatherReport/WeatherReport";
import AirQualityReport from "./pages/airquality/airquality";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Navigate replace to="/weather" />} />

          <Route path="/weather" element={<MainLayout />}>
            <Route index element={<WeatherReport />} />
            <Route path="predictions" element={<Predictions />} />
          </Route>
          <Route path="/airquality" element={<MainLayout />}>
            <Route index element={<AirQualityReport />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
