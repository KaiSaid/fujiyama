import { useState } from 'react';

const DAYS = [
  [1, 'Понедельник'], [2, 'Вторник'], [3, 'Среда'],
  [4, 'Четверг'], [5, 'Пятница'], [6, 'Суббота'], [7, 'Воскресенье'],
];

const ScheduleModal = ({ session, groups, onClose, onSave }) => {
  const [formData, setFormData] = useState(() => ({
    group: session?.group || (groups[0]?.id ?? ''),
    day_of_week: session?.day_of_week || 1,
    start_time: session?.start_time?.slice(0, 5) || '17:00',
    end_time: session?.end_time?.slice(0, 5) || '18:30',
  }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      group: Number(formData.group),
      day_of_week: Number(formData.day_of_week),
      start_time: formData.start_time,
      end_time: formData.end_time,
    });
  };

  const inputClass = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-gray-700 bg-white';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-5">
          {session ? 'Редактировать занятие' : 'Добавить занятие'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Группа</label>
            <select required name="group" value={formData.group} onChange={handleChange} className={inputClass}>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>{g.name} ({g.section_name})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">День недели</label>
            <select name="day_of_week" value={formData.day_of_week} onChange={handleChange} className={inputClass}>
              {DAYS.map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Начало</label>
              <input required type="time" name="start_time" value={formData.start_time} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Окончание</label>
              <input required type="time" name="end_time" value={formData.end_time} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div className="flex justify-end gap-3 mt-6 pt-2 border-t border-gray-50">
            <button type="button" onClick={onClose} className="px-4 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 rounded-xl transition-all">
              Отмена
            </button>
            <button type="submit" className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl shadow-sm shadow-indigo-100 transition-all">
              Сохранить
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ScheduleModal;
