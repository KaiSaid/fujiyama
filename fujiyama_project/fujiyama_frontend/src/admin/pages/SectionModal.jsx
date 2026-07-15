import { useState } from 'react';

const SectionModal = ({ section, onClose, onSave }) => {
  // Модалка монтируется заново при каждом открытии — начальное
  // состояние берём из props (общий приём всех модалок CRM).
  const [formData, setFormData] = useState(() => ({
    name: section?.name || '',
    description: section?.description || '',
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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-5">
          {section ? 'Редактировать секцию' : 'Добавить секцию'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Название</label>
            <input required type="text" name="name" value={formData.name} onChange={handleChange} placeholder="Каратэ Киокушинкай" className={inputClass} />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Описание (необязательно)</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={3} placeholder="Коротко о секции для сайта" className={`${inputClass} resize-y`} />
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

export default SectionModal;
