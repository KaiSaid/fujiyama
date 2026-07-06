import { useState, useEffect } from 'react';
import api from '../../api';
import { Users } from 'lucide-react';

const Groups = () => {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('sections/')
      .then((res) => setSections(res.data))
      .catch((err) => console.error('Ошибка загрузки групп:', err))
      .finally(() => setLoading(false));
  }, []);

  const groups = sections.flatMap((section) =>
    (section.groups || []).map((group) => ({ ...group, sectionName: section.name }))
  );

  return (
    <div className="p-8 max-w-6xl w-full mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Группы</h1>
        <p className="text-gray-400 text-sm mt-1">
          Тренировочные группы клуба. Создание и изменение — в админке Django (раздел «Группы»).
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm font-medium">Загрузка групп...</div>
        ) : (
          <table className="w-full min-w-[640px] text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-xs font-semibold uppercase tracking-wider border-b border-gray-100">
                <th className="p-4 pl-6">Группа</th>
                <th className="p-4">Секция</th>
                <th className="p-4">Тренер</th>
                <th className="p-4 pr-6">Расписание</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {groups.map((group) => (
                <tr key={group.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                        <Users size={18} />
                      </div>
                      <span className="font-semibold text-gray-900 text-sm">{group.name}</span>
                    </div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{group.sectionName}</td>
                  <td className="p-4 text-sm text-gray-600">{group.coach_name || '—'}</td>
                  <td className="p-4 pr-6">
                    {(group.schedules || []).length === 0 ? (
                      <span className="text-sm text-gray-400">не задано</span>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {group.schedules.map((sch) => (
                          <span key={sch.id} className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg text-xs">
                            {sch.day_display} {sch.start_time.slice(0, 5)}
                          </span>
                        ))}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {groups.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-12 text-center text-gray-400 text-sm">
                    Группы пока не созданы
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Groups;
