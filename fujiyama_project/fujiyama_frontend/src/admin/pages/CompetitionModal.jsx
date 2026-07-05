import { useState } from 'react';

const CompetitionModal = ({ competition, onClose, onSave }) => {
  // Модалка монтируется заново при каждом открытии — начальное
  // состояние берём из props (как в StudentModal).
  const [formData, setFormData] = useState(() => ({
    name: competition?.name || '',
    date: competition?.date || '',
    location: competition?.location || '',
  }));

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  const inputClass = 'w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-gray-700';

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-5">
          {competition ? 'Редактировать турнир' : 'Создать турнир'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Название</label>
            <input required type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Открытый чемпионат города" className={inputClass} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Дата</label>
              <input required type="date" name="date" value={formData.date} onChange={handleChange} className={inputClass} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Место</label>
              <input required type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Городской спорткомплекс" className={inputClass} />
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

export default CompetitionModal;
