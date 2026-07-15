import { useState } from 'react';

const GroupModal = ({ group, sections, staff, onClose, onSave }) => {
  const [formData, setFormData] = useState(() => ({
    name: group?.name || '',
    section: group?.section || (sections[0]?.id ?? ''),
    coach: group?.coach ?? '',
  }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      name: formData.name,
      section: Number(formData.section),
      // Пустое значение = тренер не назначен
      coach: formData.coach === '' ? null : Number(formData.coach),
    });
  };

  const inputClass = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-gray-700 bg-white';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-5">
          {group ? 'Редактировать группу' : 'Добавить группу'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Название</label>
            <input required type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Младшая группа" className={inputClass} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Секция</label>
            <select required name="section" value={formData.section} onChange={handleChange} className={inputClass}>
              {sections.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Тренер</label>
            <select name="coach" value={formData.coach} onChange={handleChange} className={inputClass}>
              <option value="">Не назначен</option>
              {staff.map((u) => (
                <option key={u.id} value={u.id}>{u.name}</option>
              ))}
            </select>
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

export default GroupModal;
