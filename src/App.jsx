import "./App.css";
import { BrowserRouter, Route, Routes, Navigate } from "react-router";
import MainLayout from "./layouts/MainLayout";
import Predictions from "./pages/predictions/predictions";
import WeatherReport from "./pages/WeatherReport/WeatherReport";
import AirQualityReport from "./pages/airquality/airquality";
import Temperature from "./pages/temperature/temperature";
import HumidityReport from "./pages/humidity/humidity";

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
          <Route path="/temperature" element={<MainLayout />}>
            <Route index element={<Temperature />} />
          </Route>
          <Route path="/humidity" element={<MainLayout />}>
            <Route index element={<HumidityReport />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
