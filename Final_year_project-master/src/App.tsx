import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import Login from './components/Login';
import WorkerDashboard from './components/WorkerDashboard';
import CameraSetup from './components/CameraSetup';
import Checkpoints from './components/Checkpoints';
import { Provider } from 'react-redux';
import store from './store';
import AdminDashboard from './components/AdminDashboard';
import Layout from './components/Layout';
import RequireAuth from './components/RequireAuth';
import MyInspections from './components/MyInspections';

function App() {
  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route element={<RequireAuth><Layout /></RequireAuth>}>
            <Route path="/" element={<Login />} />
            <Route path="/dashboard" element={<WorkerDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/camera" element={<CameraSetup />} />
            <Route path="/checkpoints" element={<Checkpoints />} />
            <Route path="/myinspections" element={<MyInspections />} />
          </Route>
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;