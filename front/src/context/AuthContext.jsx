import { createContext, useState, useEffect, useContext } from 'react';
import { initialTests } from '../data/testsData';

const AuthContext = createContext(null);

/* ── LocalStorage helpers ── */
const getStoredUsers  = () => JSON.parse(localStorage.getItem('smarttest_users') || '[]');
const saveStoredUsers = (list) => localStorage.setItem('smarttest_users', JSON.stringify(list));

const syncUserReg = (u) => {
  const list  = getStoredUsers();
  const idx   = list.findIndex(x => x.email === u.email);
  const entry = {
    email: u.email, username: u.username || u.name || '',
    role: u.role || 'student', avatar: u.avatar || '',
    password: u._password || list[idx]?.password || '',
    resultsCount: (u.results || []).length,
    registeredAt: u.registeredAt || new Date().toISOString(),
  };
  if (idx >= 0) list[idx] = { ...list[idx], ...entry };
  else          list.push(entry);
  saveStoredUsers(list);
};

const getLb  = () => JSON.parse(localStorage.getItem('smarttest_lb') || '[]');
const pushLb = (e) => { const lb = getLb(); lb.push(e); localStorage.setItem('smarttest_lb', JSON.stringify(lb)); };

/* ── Tests persistence ── */
const loadTests = () => {
  try {
    const saved = JSON.parse(localStorage.getItem('smarttest_tests') || 'null');
    return saved || initialTests;
  } catch { return initialTests; }
};
const saveTests = (list) => localStorage.setItem('smarttest_tests', JSON.stringify(list));

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(null);
  const [tests,   setTests]   = useState(loadTests);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedUser  = JSON.parse(localStorage.getItem('currentUser') || 'null');
    const savedToken = localStorage.getItem('token');
    if (savedUser && savedToken) { setUser(savedUser); setToken(savedToken); }
  }, []);

  const _save = (u, t) => {
    setUser(u); setToken(t);
    localStorage.setItem('currentUser', JSON.stringify(u));
    localStorage.setItem('token', t);
    syncUserReg(u);
  };

  /* ── Auth ── */
  const register = async ({ username, email, password, role }) => {
    const users = getStoredUsers();
    if (users.find(u => u.email === email)) {
      throw new Error('Пользователь с таким email уже существует');
    }
    const u = {
      username, name: username, email,
      role: role || 'student',
      registeredAt: new Date().toISOString(),
      results: [],
      _password: password,
    };
    const fakeToken = btoa(JSON.stringify({ email, ts: Date.now() }));
    users.push({
      email, username, role: u.role, avatar: '',
      password, resultsCount: 0, registeredAt: u.registeredAt,
    });
    saveStoredUsers(users);
    _save(u, fakeToken);
  };

  const login = async (email, password) => {
    const users = getStoredUsers();
    const found = users.find(u => u.email === email);
    if (!found) throw new Error('Пользователь не найден');
    if (found.password && found.password !== password) throw new Error('Неверный пароль');

    const savedUser = JSON.parse(localStorage.getItem('currentUser') || 'null');
    const u = (savedUser?.email === email) ? savedUser : {
      username: found.username || email.split('@')[0],
      name:     found.username || email.split('@')[0],
      email:    found.email,
      role:     found.role || 'student',
      avatar:   found.avatar || '',
      registeredAt: found.registeredAt || new Date().toISOString(),
      results:  [],
    };
    const fakeToken = btoa(JSON.stringify({ email, ts: Date.now() }));
    _save(u, fakeToken);
  };

  const logout = () => {
    setUser(null); setToken(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
  };

  /* ── Profile ── */
  const updateProfile = async (formData) => {
    const updated = { ...user, ...formData };
    setUser(updated);
    localStorage.setItem('currentUser', JSON.stringify(updated));
    syncUserReg(updated);
  };

  const updateSecurity = async (newPassword) => {
    const users = getStoredUsers();
    const idx   = users.findIndex(u => u.email === user.email);
    if (idx >= 0) { users[idx].password = newPassword; saveStoredUsers(users); }
  };

  /* ── Results ── */
  const saveTestResult = (testTitle, score, total) => {
    const result  = { date: new Date().toLocaleDateString('ru-RU'), title: testTitle, score, total };
    const updated = { ...user, results: [result, ...(user.results || [])] };
    setUser(updated);
    localStorage.setItem('currentUser', JSON.stringify(updated));
    syncUserReg(updated);
    pushLb({
      userEmail: user.email, username: user.username || user.name || user.email,
      avatar: user.avatar, testTitle, score, total,
      percent: Math.round((score / total) * 100), date: new Date().toISOString(),
    });
  };

  /* ── Tests ── */
  const addNewTest = async (newTest) => {
    const local = { ...newTest, id: Date.now(), authorEmail: user.email };
    setTests(prev => {
      const updated = [local, ...prev];
      saveTests(updated);
      return updated;
    });
  };

  /* ── Admin ── */
  const getAllUsers = () => getStoredUsers();

  const updateUserRole = (email, role) => {
    const list = getStoredUsers();
    const idx  = list.findIndex(u => u.email === email);
    if (idx >= 0) { list[idx].role = role; saveStoredUsers(list); }
    if (user?.email === email) {
      const updated = { ...user, role };
      setUser(updated);
      localStorage.setItem('currentUser', JSON.stringify(updated));
    }
  };

  const deleteTestAdmin = (testId) => {
    setTests(prev => {
      const updated = prev.filter(t => String(t.id) !== String(testId));
      saveTests(updated);
      return updated;
    });
  };

  const getLeaderboard = () => {
    const byUser = {};
    getLb().forEach(e => {
      if (!byUser[e.userEmail]) byUser[e.userEmail] = { ...e, totalTests: 0, totalScore: 0, totalPossible: 0 };
      byUser[e.userEmail].totalTests++;
      byUser[e.userEmail].totalScore    += e.score;
      byUser[e.userEmail].totalPossible += e.total;
    });
    return Object.values(byUser)
      .map(u => ({ ...u, avgPercent: Math.round((u.totalScore / u.totalPossible) * 100) }))
      .sort((a, b) => b.avgPercent - a.avgPercent || b.totalTests - a.totalTests);
  };

  return (
    <AuthContext.Provider value={{
      user, token, tests, loading,
      login, register, logout,
      updateProfile, updateSecurity, saveTestResult, addNewTest,
      getAllUsers, updateUserRole, deleteTestAdmin, getLeaderboard,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
