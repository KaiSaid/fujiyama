import { useState, useEffect } from 'react';
import { clubService } from '../services/studentService';
import ScheduleModal from './ScheduleModal';
import { Clock, Users, Layers, Plus, Edit, Trash2 } from 'lucide-react';

const Schedule = () => {
  const [sessions, setSessions] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null); // {item: занятие|null}

  const loadAll = () =>
    Promise.all([clubService.getSchedules(), clubService.getGroups()])
      .then(([sch, g]) => {
        setSessions(sch.results || sch);
        setGroups(g.results || g);
      })
      .catch((error) => console.error('Ошибка загрузки расписания:', error))
      .finally(() => setLoading(false));

  // loading уже true при монтировании — эффект только загружает данные
  useEffect(() => {
    loadAll();
  }, []);

  const handleSave = async (data) => {
    try {
      if (modal.item) {
        await clubService.updateSchedule(modal.item.id, data);
      } else {
        await clubService.createSchedule(data);
      }
      setModal(null);
      loadAll();
    } catch (error) {
      console.error('Ошибка сохранения занятия:', error);
      const server = error.response?.data;
      const first = server?.end_time?.[0] || server?.group?.[0] || server?.detail;
      alert(first || 'Не удалось сохранить занятие.');
    }
  };

  const handleDelete = async (session) => {
    if (!window.confirm(`Удалить занятие «${session.group_name}, ${session.day_display}»?`)) return;
    try {
      await clubService.deleteSchedule(session.id);
      setSessions(sessions.filter((s) => s.id !== session.id));
    } catch (error) {
      console.error('Ошибка удаления занятия:', error);
      alert('Не удалось удалить занятие.');
    }
  };

  const groupById = (id) => groups.find((g) => g.id === id);

  return (
    <div className="p-4 sm:p-8 max-w-6xl w-full mx-auto">
      <div className="flex flex-wrap gap-3 justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Расписание тренировок</h1>
          <p className="text-gray-400 text-sm mt-1">График занятий клуба «Фудзияма» — сразу отображается на сайте</p>
        </div>
        <button
          onClick={() => {
            if (groups.length === 0) { alert('Сначала создайте группу (страница «Группы»).'); return; }
            setModal({ item: null });
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm font-medium transition-all text-sm"
        >
          <Plus size={18} /> Добавить занятие
        </button>
      </div>

      {loading ? (
        <div className="p-12 text-center text-gray-400 text-sm font-medium">Загрузка расписания...</div>
      ) : sessions.length === 0 ? (
        <div className="p-12 text-center text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">
          Занятия пока не запланированы — добавьте первое кнопкой «Добавить занятие»
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sessions.map((session) => (
            <div key={session.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-4">
                <span className="bg-indigo-50 text-indigo-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                  {session.day_display}
                </span>
                <div className="flex gap-1">
                  <button onClick={() => setModal({ item: session })} title="Редактировать" className="p-1.5 text-gray-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                    <Edit size={15} />
                  </button>
                  <button onClick={() => handleDelete(session)} title="Удалить" className="p-1.5 text-gray-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{session.group_name}</h3>

              <div className="space-y-3 mt-4">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Clock size={16} className="text-gray-400" />
                  <span>{session.start_time.slice(0, 5)} – {session.end_time.slice(0, 5)}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Layers size={16} className="text-gray-400" />
                  <span>{groupById(session.group)?.section_name || '—'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Users size={16} className="text-gray-400" />
                  <span>Тренер: {groupById(session.group)?.coach_name || 'не назначен'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modal && (
        <ScheduleModal session={modal.item} groups={groups} onClose={() => setModal(null)} onSave={handleSave} />
      )}
    </div>
  );
};

export default Schedule;
