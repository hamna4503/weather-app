import "./App.css";
import { BrowserRouter, Route, Routes } from "react-router";
import MainLayout from "./layouts/MainLayout";
import Predictions from "./pages/predictions/predictions";

function App() {
  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="weather" element={<MainLayout />}>
            <Route path="predictions" element={<Predictions />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
