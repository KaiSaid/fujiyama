import { useState, useEffect } from 'react';
import { clubService } from '../services/studentService';
import SectionModal from './SectionModal';
import GroupModal from './GroupModal';
import { Users, Layers, Plus, Edit, Trash2 } from 'lucide-react';

const Groups = () => {
  const [sections, setSections] = useState([]);
  const [groups, setGroups] = useState([]);
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  // Какая модалка открыта: {type: 'section'|'group', item: объект|null}
  const [modal, setModal] = useState(null);

  const loadAll = () =>
    Promise.all([clubService.getSections(), clubService.getGroups(), clubService.getStaff()])
      .then(([s, g, st]) => {
        setSections(s.results || s);
        setGroups(g.results || g);
        setStaff(st);
      })
      .catch((error) => console.error('Ошибка загрузки групп:', error))
      .finally(() => setLoading(false));

  // loading уже true при монтировании — эффект только загружает данные
  useEffect(() => {
    loadAll();
  }, []);

  const showServerError = (error, fallback) => {
    console.error(fallback, error);
    const data = error.response?.data;
    const first = data?.name?.[0] || data?.section?.[0] || data?.coach?.[0] || data?.detail;
    alert(first || fallback);
  };

  // --- Секции ---
  const saveSection = async (data) => {
    try {
      if (modal.item) {
        await clubService.updateSection(modal.item.id, data);
      } else {
        await clubService.createSection(data);
      }
      setModal(null);
      loadAll();
    } catch (error) {
      showServerError(error, 'Не удалось сохранить секцию.');
    }
  };

  const deleteSection = async (section) => {
    if (!window.confirm(`Удалить секцию «${section.name}»? Все её группы, расписание и заявки будут удалены!`)) return;
    try {
      await clubService.deleteSection(section.id);
      loadAll();
    } catch (error) {
      showServerError(error, 'Не удалось удалить секцию.');
    }
  };

  // --- Группы ---
  const saveGroup = async (data) => {
    try {
      if (modal.item) {
        await clubService.updateGroup(modal.item.id, data);
      } else {
        await clubService.createGroup(data);
      }
      setModal(null);
      loadAll();
    } catch (error) {
      showServerError(error, 'Не удалось сохранить группу.');
    }
  };

  const deleteGroup = async (group) => {
    if (!window.confirm(`Удалить группу «${group.name}»? Её расписание и заявки будут удалены.`)) return;
    try {
      await clubService.deleteGroup(group.id);
      loadAll();
    } catch (error) {
      showServerError(error, 'Не удалось удалить группу.');
    }
  };

  return (
    <div className="p-4 sm:p-8 max-w-6xl w-full mx-auto">
      {/* --- Секции --- */}
      <div className="flex flex-wrap gap-3 justify-between items-center mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Секции</h1>
          <p className="text-gray-400 text-sm mt-1">Направления клуба — показываются на сайте</p>
        </div>
        <button
          onClick={() => setModal({ type: 'section', item: null })}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm font-medium transition-all text-sm"
        >
          <Plus size={18} /> Добавить секцию
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {loading ? (
          <div className="col-span-full p-8 text-center text-gray-400 text-sm font-medium">Загрузка...</div>
        ) : sections.length === 0 ? (
          <div className="col-span-full p-8 text-center text-gray-400 text-sm bg-white rounded-2xl border border-gray-100">
            Секций пока нет — начните с кнопки «Добавить секцию»
          </div>
        ) : (
          sections.map((section) => (
            <div key={section.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                  <Layers size={20} />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-gray-900 text-sm truncate">{section.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">Групп: {section.groups_count}</div>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <button onClick={() => setModal({ type: 'section', item: section })} title="Редактировать" className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                  <Edit size={15} />
                </button>
                <button onClick={() => deleteSection(section)} title="Удалить" className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* --- Группы --- */}
      <div className="flex flex-wrap gap-3 justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Группы</h2>
          <p className="text-gray-400 text-sm mt-1">Тренировочные группы внутри секций</p>
        </div>
        <button
          onClick={() => {
            if (sections.length === 0) { alert('Сначала создайте секцию.'); return; }
            setModal({ type: 'group', item: null });
          }}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl flex items-center gap-2 shadow-sm font-medium transition-all text-sm"
        >
          <Plus size={18} /> Добавить группу
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-x-auto">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm font-medium">Загрузка групп...</div>
        ) : (
          <table className="w-full min-w-[560px] text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-xs font-semibold uppercase tracking-wider border-b border-gray-100">
                <th className="p-4 pl-6">Группа</th>
                <th className="p-4">Секция</th>
                <th className="p-4">Тренер</th>
                <th className="p-4 pr-6 text-right">Действия</th>
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
                  <td className="p-4 text-sm text-gray-600">{group.section_name}</td>
                  <td className="p-4 text-sm text-gray-600">{group.coach_name || '—'}</td>
                  <td className="p-4 pr-6 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => setModal({ type: 'group', item: group })} title="Редактировать" className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => deleteGroup(group)} title="Удалить" className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {groups.length === 0 && (
                <tr>
                  <td colSpan="4" className="p-12 text-center text-gray-400 text-sm">
                    Групп пока нет — создайте первую кнопкой «Добавить группу»
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {modal?.type === 'section' && (
        <SectionModal section={modal.item} onClose={() => setModal(null)} onSave={saveSection} />
      )}
      {modal?.type === 'group' && (
        <GroupModal group={modal.item} sections={sections} staff={staff} onClose={() => setModal(null)} onSave={saveGroup} />
      )}
    </div>
  );
};

export default Groups;
