import { useState, useEffect } from 'react';
import { Outlet, NavLink, Navigate, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Medal,
  LogOut,
  Bell,
  Globe,
  ClipboardList,
  Menu,
  X
} from 'lucide-react';
import api from '../../api';
import { studentService } from '../services/studentService';

const AdminLayout = () => {
  const navigate = useNavigate();
  const [newRequests, setNewRequests] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Состояние проверки прав: 'checking' | 'ok' | 'denied'.
  // Если токена нет вовсе — сразу 'denied', без лишнего запроса.
  const [authState, setAuthState] = useState(() => {
    const token = localStorage.getItem('access_token') || localStorage.getItem('token');
    return token ? 'checking' : 'denied';
  });

  // При входе в панель проверяем на сервере, что токен действителен
  // И принадлежит администратору. Иначе — на страницу входа.
  useEffect(() => {
    if (authState !== 'checking') return;
    let active = true;
    api.get('profile-data/')
      .then((res) => { if (active) setAuthState(res.data.is_superuser ? 'ok' : 'denied'); })
      .catch(() => { if (active) setAuthState('denied'); });
    return () => { active = false; };
  }, [authState]);

  // Счётчик новых заявок с сайта — только после подтверждения прав, раз в минуту
  useEffect(() => {
    if (authState !== 'ok') return;
    const load = () =>
      studentService.getStats()
        .then((stats) => setNewRequests(stats.new_trial_requests || 0))
        .catch(() => {});
    load();
    const timer = setInterval(load, 60000);
    return () => clearInterval(timer);
  }, [authState]);

  // Пока проверяем права — показываем заглушку
  if (authState === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-400 text-sm font-medium">
        Проверка доступа…
      </div>
    );
  }
  // Нет токена или не администратор — на страницу входа
  if (authState === 'denied') {
    return <Navigate to="/admin/login" replace />;
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    navigate('/admin/login');
  };

  const menuItems = [
    { name: 'Дашборд', path: '/admin', icon: LayoutDashboard, exact: true },
    { name: 'Заявки', path: '/admin/requests', icon: ClipboardList, badge: newRequests },
    { name: 'Ученики', path: '/admin/students', icon: Users },
    { name: 'Группы', path: '/admin/groups', icon: Users },
    { name: 'Расписание', path: '/admin/schedule', icon: Calendar },
    { name: 'Соревнования', path: '/admin/competitions', icon: Medal },
  ];

  // Имя вошедшего администратора (сохраняется при входе)
  const adminName = localStorage.getItem('username') || 'Администратор';

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans text-slate-900">

      {/* Затемнение под открытым меню (только на телефоне) */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/40 z-20 md:hidden"
        />
      )}

      {/* SIDEBAR — на телефоне выезжает слева, на десктопе закреплён */}
      <aside
        className={`w-64 bg-white border-r border-slate-200 flex flex-col fixed h-full z-30 transition-transform duration-200
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200">
          <Link to="/" className="text-xl font-bold text-indigo-600 tracking-tight hover:text-indigo-700 transition-colors" title="Открыть сайт клуба">
            Fujiyama CRM
          </Link>
          {/* Крестик закрытия — только на телефоне */}
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-slate-700">
            <X size={20} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.exact}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 font-medium text-sm ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              <item.icon size={18} className="shrink-0" />
              <span className="flex-1">{item.name}</span>
              {item.badge > 0 && (
                <span className="min-w-[20px] h-5 px-1.5 bg-indigo-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t border-slate-200 space-y-1">
          <Link to="/" className="flex items-center gap-3 text-slate-500 hover:text-indigo-600 transition-colors w-full px-3 py-2 text-sm font-medium">
            <Globe size={18} />
            Открыть сайт
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-3 text-slate-500 hover:text-red-600 transition-colors w-full px-3 py-2 text-sm font-medium">
            <LogOut size={18} />
            Выйти
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen min-w-0">

        {/* TOPBAR */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-10">
          {/* Кнопка-гамбургер — только на телефоне */}
          <button
            onClick={() => setSidebarOpen(true)}
            aria-label="Меню"
            className="md:hidden text-slate-500 hover:text-slate-900 -ml-1 p-1"
          >
            <Menu size={24} />
          </button>

          <div className="flex items-center gap-4 sm:gap-6 ml-auto">
            {/* Колокольчик показывает число новых заявок и ведёт на их страницу */}
            <button
              onClick={() => navigate('/admin/requests')}
              title={newRequests > 0 ? `Новых заявок: ${newRequests}` : 'Заявок нет'}
              className="text-slate-400 hover:text-indigo-600 transition-colors relative"
            >
              <Bell size={20} />
              {newRequests > 0 && (
                <span className="absolute -top-2 -right-2 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border border-white">
                  {newRequests}
                </span>
              )}
            </button>

            <div className="flex items-center gap-3 pl-4 sm:pl-6 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-slate-700 leading-none">{adminName}</p>
                <p className="text-xs text-slate-500 mt-1">Администратор</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm uppercase">
                {adminName.slice(0, 2)}
              </div>
            </div>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
