import { useState, useEffect } from 'react';
import api from '../../api';
import { Clock, Users, Layers } from 'lucide-react';

const Schedule = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('sections/')
      .then((res) => setSections(res.data))
      .catch((err) => console.error('Ошибка загрузки расписания:', err))
      .finally(() => setLoading(false));
  }, []);

  // Разворачиваем секции → группы → занятия в плоский список карточек,
  // отсортированный по дню недели и времени начала.
  const sessions = sections
    .flatMap((section) =>
      (section.groups || []).flatMap((group) =>
        (group.schedules || []).map((sch) => ({
          id: sch.id,
          day: sch.day_display,
          dayOrder: sch.day_of_week,
          time: `${sch.start_time.slice(0, 5)} – ${sch.end_time.slice(0, 5)}`,
          group: group.name,
          section: section.name,
          coach: group.coach_name,
        }))
      )
    )
    .sort((a, b) => a.dayOrder - b.dayOrder || a.time.localeCompare(b.time));

  return (
    <div className="p-8 max-w-6xl w-full mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Расписание тренировок</h1>
        <p className="text-gray-400 text-sm mt-1">
          График занятий клуба «Фудзияма». Изменить расписание можно в админке Django (раздел «Расписания»).
        </p>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-400 text-sm font-medium">Загрузка расписания...</div>
      ) : sessions.length === 0 ? (
        <div className="p-12 text-center text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">
          Занятия пока не запланированы
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <div key={session.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-indigo-50 text-indigo-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {session.day}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{session.group}</h3>

              <div className="space-y-3 mt-4">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Clock size={16} className="text-gray-400" />
                  <span>{session.time}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Layers size={16} className="text-gray-400" />
                  <span>{session.section}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Users size={16} className="text-gray-400" />
                  <span>Тренер: {session.coach || 'не назначен'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Schedule;
