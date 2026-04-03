import { Routes, Route } from 'react-router-dom';
import { Layout }        from './components/Layout';
import { PrivateRoute }  from './components/PrivateRoute';
import { AuthProvider }  from './context/AuthContext';

import { Home }        from './pages/Home';
import { Login }       from './pages/Login';
import { Register }    from './pages/Register';
import { TestsList }   from './pages/TestsList';
import { TestRoom }    from './pages/TestRoom';
import { CreateTest }  from './pages/CreateTest';
import { Profile }     from './pages/Profile';
import { Security }    from './pages/Security';
import { Leaderboard } from './pages/Leaderboard';
import { Admin }       from './pages/Admin';
import { NotFound }    from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index           element={<Home />} />
          <Route path="login"    element={<Login />} />
          <Route path="register" element={<Register />} />

          <Route path="tests"       element={<PrivateRoute><TestsList /></PrivateRoute>} />
          <Route path="create"      element={<PrivateRoute><CreateTest /></PrivateRoute>} />
          <Route path="room/:id"    element={<PrivateRoute><TestRoom /></PrivateRoute>} />
          <Route path="profile"     element={<PrivateRoute><Profile /></PrivateRoute>} />
          <Route path="security"    element={<PrivateRoute><Security /></PrivateRoute>} />
          <Route path="leaderboard" element={<PrivateRoute><Leaderboard /></PrivateRoute>} />
          <Route path="admin"       element={<PrivateRoute><Admin /></PrivateRoute>} />

          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </AuthProvider>
  );
}

export default App;
