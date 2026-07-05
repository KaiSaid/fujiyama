import { useState } from 'react';

const StudentModal = ({ student, onClose, onSave }) => {
  // Модалка монтируется заново при каждом открытии (условный рендер в
  // StudentsList), поэтому начальное состояние берём прямо из props.
  const [formData, setFormData] = useState(() => ({
    first_name: student?.first_name || '',
    last_name: student?.last_name || '',
    email: student?.email || '',
    rank: student?.rank || '',
    is_active: student?.is_active !== undefined ? student.is_active : true,
  }));

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // PUT на сервере требует username: при редактировании берём его
    // у текущего ученика, при создании — генерируем из email.
    const dataToSubmit = { ...formData };
    if (student) {
      dataToSubmit.username = student.username;
    } else if (!dataToSubmit.username) {
      dataToSubmit.username = dataToSubmit.email.split('@')[0];
    }

    // Сохранение (create/update) и закрытие модалки выполняет родитель.
    onSave(dataToSubmit);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-5">
          {student ? 'Редактировать ученика' : 'Добавить ученика'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Имя</label>
              <input required type="text" name="first_name" value={formData.first_name} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-gray-700" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Фамилия</label>
              <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-gray-700" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Email</label>
              <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-gray-700" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Квалификация</label>
              <select 
                name="rank" 
                value={formData.rank} 
                onChange={handleChange} 
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-gray-700 bg-white"
              >
                <option value="">Без квалификации</option>
                <option value="9 Кю">9 Кю</option>
                <option value="8 Кю">8 Кю</option>
                <option value="7 Кю">7 Кю</option>
                <option value="6 Кю">6 Кю</option>
                <option value="5 Кю">5 Кю</option>
                <option value="4 Кю">4 Кю</option>
                <option value="3 Кю">3 Кю</option>
                <option value="2 Кю">2 Кю</option>
                <option value="1 Кю">1 Кю</option>
                <option value="1 Дан">1 Дан</option>
                <option value="2 Дан">2 Дан</option>
                <option value="3 Дан">3 Дан</option>
                <option value="4 Дан">4 Дан</option>
                <option value="5 Дан">5 Дан</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2.5 pt-2">
            <input type="checkbox" id="is_active" name="is_active" checked={formData.is_active} onChange={handleChange} className="w-4 h-4 rounded text-indigo-600 border-gray-300 focus:ring-indigo-500" />
            <label htmlFor="is_active" className="text-sm font-medium text-gray-600 select-none">Активный аккаунт</label>
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

export default StudentModal;