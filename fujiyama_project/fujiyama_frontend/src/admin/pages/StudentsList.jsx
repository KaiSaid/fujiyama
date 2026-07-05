import { useState, useEffect } from 'react';
import { studentService } from '../services/studentService';
import StudentModal from './StudentModal';
import { Search, Edit, Trash2, Plus } from 'lucide-react';

const StudentsList = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);

  // Загрузка списка учеников
  const fetchStudents = async () => {
    setLoading(true);
    try {
      const data = await studentService.getStudents({ search: searchQuery });
      setStudents(data.results || data); 
    } catch (error) {
      console.error('Ошибка при загрузке учеников:', error);
      alert('Не удалось загрузить список учеников. Проверь: \n1. Запущен ли сервер Django (python manage.py runserver)\n2. Правильно ли указан URL в studentService.js');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchStudents();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  // Удаление ученика
  const handleDelete = async (id) => {
    if (window.confirm('Вы уверены, что хотите удалить этого ученика?')) {
      try {
        await studentService.deleteStudent(id);
        setStudents(students.filter(student => student.id !== id));
        alert('Ученик успешно удален');
      } catch (error) {
        console.error('Ошибка удаления:', error);
        alert('Ошибка при удалении ученика на сервере.');
      }
    }
  };

  const handleOpenModal = (student = null) => {
    setIsModalOpen(true);
    setEditingStudent(student);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingStudent(null);
  };

  // Сохранение и создание ученика
  const handleSaveStudent = async (studentData) => {
    try {
      if (editingStudent) {
        // Редактирование
        await studentService.updateStudent(editingStudent.id, studentData);
        alert('Данные ученика успешно обновлены!');
      } else {
        // Создание нового
        await studentService.createStudent(studentData);
        alert('Новый ученик успешно добавлен в базу данных!');
      }
      fetchStudents(); // Обновляем таблицу новыми данными
      handleCloseModal(); // Закрываем модалку
    } catch (error) {
      console.error('Ошибка сохранения:', error);
      
      // Если Django вернул ошибку валидации (например, неуникальный username)
      if (error.response && error.response.data) {
        const serverErrors = error.response.data;
        let errorMessage = 'Ошибка валидации на сервере:\n';
        for (const key in serverErrors) {
          errorMessage += `${key}: ${serverErrors[key]}\n`;
        }
        alert(errorMessage);
      } else {
        alert('Не удалось связаться с сервером для сохранения данных.');
      }
    }
  };

  return (
    <div className="p-8 max-w-6xl w-full mx-auto">
      
      {/* Заголовок страницы */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Ученики клуба</h1>
          <p className="text-gray-400 text-sm mt-1">Всего зарегистрировано: {students.length}</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm shadow-indigo-100 font-medium transition-all text-sm"
        >
          <Plus size={18} /> Добавить ученика
        </button>
      </div>

      {/* Поиск */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Поиск по имени, email или username..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all text-sm placeholder-gray-400 text-gray-700"
          />
        </div>
      </div>

      {/* Таблица */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm font-medium">Загрузка данных из системы...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/50 text-gray-400 text-xs font-semibold uppercase tracking-wider">
                <th className="p-4 pl-6 font-medium">Спортсмен</th>
                <th className="p-4 font-medium">Квалификация</th>
                <th className="p-4 font-medium">Контакты</th>
                <th className="p-4 font-medium">Статус</th>
                <th className="p-4 pr-6 font-medium text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {students.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="p-4 pl-6 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-semibold text-sm">
                      {student.first_name?.[0] || student.username?.[0] || 'U'}
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 text-sm">{student.first_name} {student.last_name}</div>
                      <div className="text-xs text-gray-400 mt-0.5">@{student.username}</div>
                    </div>
                  </td>
                  <td className="p-4 text-sm font-medium text-gray-600">
                    <span className="bg-gray-100 text-gray-700 px-2.5 py-1 rounded-lg text-xs">
                      {student.rank || 'Без Кю/Дана'}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="text-sm text-gray-600 font-medium">{student.email}</div>
                    <div className="text-xs text-gray-400 mt-0.5">Рег: {student.date_joined?.split('T')[0]}</div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${student.is_active ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${student.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                      {student.is_active ? 'Активен' : 'Неактивен'}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => handleOpenModal(student)} className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(student.id)} className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {students.length === 0 && !loading && (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-gray-400 text-sm">
                    Ученики не найдены
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Модальное окно */}
      {isModalOpen && (
        <StudentModal 
          student={editingStudent} 
          onClose={handleCloseModal} 
          onSave={handleSaveStudent} 
        />
      )}
    </div>
  );
};

export default StudentsList;