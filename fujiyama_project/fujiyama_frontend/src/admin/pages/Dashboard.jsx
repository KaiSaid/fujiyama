import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { studentService } from '../services/studentService';
import { Users, Layers, Calendar, ClipboardList, Medal, LayoutDashboard } from 'lucide-react';

const CARDS = [
  { key: 'new_trial_requests', label: 'Новые заявки с сайта', icon: ClipboardList, color: 'bg-rose-50 text-rose-600', link: '/admin/requests' },
  { key: 'students', label: 'Активных учеников', icon: Users, color: 'bg-indigo-50 text-indigo-600' },
  { key: 'sections', label: 'Секций', icon: Layers, color: 'bg-amber-50 text-amber-600' },
  { key: 'groups', label: 'Групп', icon: LayoutDashboard, color: 'bg-emerald-50 text-emerald-600' },
  { key: 'schedules', label: 'Занятий в неделю', icon: Calendar, color: 'bg-sky-50 text-sky-600' },
  { key: 'upcoming_competitions', label: 'Ближайших турниров', icon: Medal, color: 'bg-violet-50 text-violet-600' },
];

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    studentService.getStats()
      .then(setStats)
      .catch((err) => {
        console.error('Ошибка загрузки статистики:', err);
        setError('Не удалось загрузить статистику. Проверьте, запущен ли сервер.');
      });
  }, []);

  return (
    <div className="p-8 max-w-6xl w-full mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Дашборд</h1>
        <p className="text-gray-400 text-sm mt-1">Ключевые показатели клуба «Фудзияма»</p>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-600 text-sm rounded-xl mb-6">
          {error}
        </div>
      )}

      {!stats && !error && (
        <div className="p-12 text-center text-gray-400 text-sm font-medium">Загрузка статистики...</div>
      )}

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {CARDS.map(({ key, label, icon: Icon, color, link }) => {
            const card = (
              <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex items-center gap-4 ${link ? 'hover:shadow-md hover:border-indigo-100 transition-all cursor-pointer' : ''}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${color}`}>
                  <Icon size={22} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-gray-900 leading-none">{stats[key] ?? 0}</div>
                  <div className="text-sm text-gray-400 mt-1.5">{label}</div>
                </div>
              </div>
            );
            return link
              ? <Link key={key} to={link}>{card}</Link>
              : <div key={key}>{card}</div>;
          })}
        </div>
      )}
    </div>
  );
};

export default Dashboard;
