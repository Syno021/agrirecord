import { AnimatePresence } from 'framer-motion';
import { Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import {
  Bell,
  Compass,
  Grid3X3,
  Leaf,
  LogOut,
  Map,
  Package,
  User,
} from 'lucide-react';
import Dashboard from './pages/Dashboard';
import WebLogin from './pages/WebLogin';

const navItems = [
  { path: '/', label: 'Home', icon: Grid3X3 },
  { path: '/farms', label: 'Farms', icon: Map },
  { path: '/inventory', label: 'Inventory', icon: Package },
  { path: '/roadmaps', label: 'Roadmaps', icon: Compass },
  { path: '/alerts', label: 'Alerts', icon: Bell },
  { path: '/profile', label: 'Profile', icon: User },
];

function Sidebar({ onSignOut }: { onSignOut: () => void }) {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <aside className="hidden lg:flex w-72 flex-col border-r border-brand-border bg-brand-surface p-8">
      <div className="mb-10 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-primary">
          <Leaf className="h-6 w-6 text-white" />
        </div>
        <div>
          <p className="font-display text-lg font-bold text-brand-primary">AgriRecord</p>
          <p className="text-xs text-brand-muted-foreground">AI Precision</p>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-2">
        {navItems.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <button
              key={path}
              type="button"
              onClick={() => navigate(path)}
              className={active ? 'nav-item-active flex items-center gap-3 text-left' : 'nav-item-inactive flex items-center gap-3 text-left'}
            >
              <Icon size={20} />
              {label}
            </button>
          );
        })}
      </nav>
      <button
        type="button"
        onClick={onSignOut}
        className="nav-item-inactive mt-auto flex items-center gap-3 text-left text-brand-danger"
      >
        <LogOut size={20} />
        Sign Out
      </button>
    </aside>
  );
}

function MobileNav() {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="floating-nav lg:hidden">
      {navItems.slice(0, 5).map(({ path, label, icon: Icon }) => {
        const active = location.pathname === path;
        return (
          <button
            key={path}
            type="button"
            onClick={() => navigate(path)}
            className={`flex flex-col items-center gap-1 text-xs font-display font-semibold ${active ? 'nav-tab-active' : 'nav-tab-inactive'}`}
          >
            <Icon size={20} />
            {label}
          </button>
        );
      })}
    </nav>
  );
}

function AppShell() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen">
      <Sidebar onSignOut={() => navigate('/login')} />
      <main className="flex-1 bg-brand-background px-6 py-8 pb-32 lg:px-12 lg:pb-8">
        <div className="mx-auto max-w-6xl">
          <Outlet />
        </div>
      </main>
      <MobileNav />
    </div>
  );
}

function Placeholder({ title }: { title: string }) {
  return (
    <div className="rounded-[20px] border border-brand-border bg-brand-surface p-8 shadow-card">
      <h1 className="font-display text-2xl font-bold text-brand-primary">{title}</h1>
      <p className="mt-2 text-brand-muted-foreground">Coming soon on web.</p>
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const isAuth = location.pathname === '/login';

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={<WebLogin />} />
        <Route element={<AppShell />}>
          <Route path="/" element={<Dashboard />} />
          <Route path="/farms" element={<Placeholder title="Farms" />} />
          <Route path="/inventory" element={<Placeholder title="Inventory" />} />
          <Route path="/roadmaps" element={<Placeholder title="Roadmaps" />} />
          <Route path="/alerts" element={<Placeholder title="Alerts" />} />
          <Route path="/profile" element={<Placeholder title="Profile" />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      {!isAuth && null}
    </AnimatePresence>
  );
}
