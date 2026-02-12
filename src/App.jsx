import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import { BillProvider } from './context/BillContext';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';

function App() {
  return (
    <BillProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="dashboard" element={<Dashboard />} />
          </Route>
        </Routes>
      </Router>
    </BillProvider>
  );
}

export default App;
