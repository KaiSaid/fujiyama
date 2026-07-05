import { useState, useEffect } from 'react';
import { requestService } from '../services/studentService';
import { Phone, Check, Trash2 } from 'lucide-react';

const Requests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // loading уже true при монтировании — эффект только загружает данные
  useEffect(() => {
    requestService.getRequests()
      .then((data) => setRequests(data.results || data))
      .catch((error) => console.error('Ошибка загрузки заявок:', error))
      .finally(() => setLoading(false));
  }, []);

  const handleProcessed = async (id) => {
    try {
      const updated = await requestService.markProcessed(id);
      setRequests(requests.map((r) => (r.id === id ? updated : r)));
    } catch (error) {
      console.error('Ошибка обновления заявки:', error);
      alert('Не удалось обновить заявку.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить заявку? Контакт человека будет потерян.')) return;
    try {
      await requestService.deleteRequest(id);
      setRequests(requests.filter((r) => r.id !== id));
    } catch (error) {
      console.error('Ошибка удаления заявки:', error);
      alert('Не удалось удалить заявку.');
    }
  };

  const newCount = requests.filter((r) => r.status === 'new').length;

  return (
    <div className="p-8 max-w-6xl w-full mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Заявки на запись</h1>
        <p className="text-gray-400 text-sm mt-1">
          Люди оставили контакты через форму «Записаться» на сайте — позвоните и договоритесь о тренировке.
          {newCount > 0 && <span className="text-indigo-600 font-semibold"> Новых: {newCount}</span>}
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm font-medium">Загрузка заявок...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-xs font-semibold uppercase tracking-wider border-b border-gray-100">
                <th className="p-4 pl-6">Имя</th>
                <th className="p-4">Телефон</th>
                <th className="p-4">Группа</th>
                <th className="p-4">Комментарий</th>
                <th className="p-4">Получена</th>
                <th className="p-4">Статус</th>
                <th className="p-4 pr-6 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {requests.map((req) => (
                <tr key={req.id} className={`transition-colors ${req.status === 'new' ? 'bg-indigo-50/30' : ''} hover:bg-gray-50/70`}>
                  <td className="p-4 pl-6 font-semibold text-gray-900 text-sm">{req.name}</td>
                  <td className="p-4">
                    <a href={`tel:${req.phone.replace(/[^\d+]/g, '')}`} className="flex items-center gap-2 text-sm text-indigo-600 font-medium hover:text-indigo-800">
                      <Phone size={14} /> {req.phone}
                    </a>
                  </td>
                  <td className="p-4 text-sm text-gray-600">{req.group_name || '—'}</td>
                  <td className="p-4 text-sm text-gray-500 max-w-[220px] truncate" title={req.comment}>{req.comment || '—'}</td>
                  <td className="p-4 text-sm text-gray-500 whitespace-nowrap">{req.created}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${req.status === 'new' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${req.status === 'new' ? 'bg-indigo-500' : 'bg-emerald-500'}`}></span>
                      {req.status_display}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <div className="flex justify-end gap-1.5">
                      {req.status === 'new' && (
                        <button onClick={() => handleProcessed(req.id)} title="Отметить обработанной" className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-all">
                          <Check size={16} />
                        </button>
                      )}
                      <button onClick={() => handleDelete(req.id)} title="Удалить" className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {requests.length === 0 && !loading && (
                <tr>
                  <td colSpan="7" className="p-12 text-center text-gray-400 text-sm">
                    Заявок пока нет
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

export default Requests;
