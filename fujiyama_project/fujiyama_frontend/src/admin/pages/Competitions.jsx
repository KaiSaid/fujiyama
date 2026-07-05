import { useState, useEffect } from 'react';
import { competitionService } from '../services/studentService';
import CompetitionModal from './CompetitionModal';
import { Trophy, Calendar as CalendarIcon, MapPin, Users, Plus, Edit, Trash2 } from 'lucide-react';

const Competitions = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const fetchTournaments = () =>
    competitionService.getCompetitions()
      .then((data) => setTournaments(data.results || data))
      .catch((error) => console.error('Ошибка загрузки турниров:', error))
      .finally(() => setLoading(false));

  // loading уже true при монтировании — эффект только загружает данные
  useEffect(() => {
    fetchTournaments();
  }, []);

  const handleOpenModal = (tournament = null) => {
    setEditing(tournament);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setEditing(null);
    setIsModalOpen(false);
  };

  const handleSave = async (data) => {
    try {
      if (editing) {
        await competitionService.updateCompetition(editing.id, data);
      } else {
        await competitionService.createCompetition(data);
      }
      handleCloseModal();
      fetchTournaments();
    } catch (error) {
      console.error('Ошибка сохранения турнира:', error);
      const server = error.response?.data;
      const first = server?.name?.[0] || server?.date?.[0] || server?.location?.[0];
      alert(first || 'Не удалось сохранить турнир.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить турнир? Заявки участников на него тоже будут удалены.')) return;
    try {
      await competitionService.deleteCompetition(id);
      setTournaments(tournaments.filter((t) => t.id !== id));
    } catch (error) {
      console.error('Ошибка удаления турнира:', error);
      alert('Не удалось удалить турнир.');
    }
  };

  return (
    <div className="p-8 max-w-6xl w-full mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Соревнования и Мероприятия</h1>
          <p className="text-gray-400 text-sm mt-1">Управление турнирами и заявками учеников</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 shadow-sm font-medium transition-all text-sm"
        >
          <Plus size={18} /> Создать турнир
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-400 text-sm font-medium">Загрузка турниров...</div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50 text-gray-400 text-xs font-semibold uppercase tracking-wider border-b border-gray-100">
                <th className="p-4 pl-6">Турнир</th>
                <th className="p-4">Дата и Место</th>
                <th className="p-4">Заявки</th>
                <th className="p-4">Статус</th>
                <th className="p-4 pr-6 text-right">Действия</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {tournaments.map((tournament) => (
                <tr key={tournament.id} className="hover:bg-gray-50/70 transition-colors">
                  <td className="p-4 pl-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                        <Trophy size={20} />
                      </div>
                      <div className="font-semibold text-gray-900 text-sm">{tournament.name}</div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                      <CalendarIcon size={14} className="text-gray-400" /> {tournament.date_display}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <MapPin size={14} /> {tournament.location}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users size={16} className="text-gray-400" /> {tournament.applications_count} чел.
                    </div>
                  </td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      tournament.is_upcoming ? 'bg-indigo-50 text-indigo-600' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {tournament.is_upcoming ? 'Ожидается' : 'Завершено'}
                    </span>
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <div className="flex justify-end gap-1.5">
                      <button onClick={() => handleOpenModal(tournament)} title="Редактировать" className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all">
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(tournament.id)} title="Удалить" className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {tournaments.length === 0 && !loading && (
                <tr>
                  <td colSpan="5" className="p-12 text-center text-gray-400 text-sm">
                    Турниров пока нет — создайте первый кнопкой «Создать турнир»
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {isModalOpen && (
        <CompetitionModal
          competition={editing}
          onClose={handleCloseModal}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

export default Competitions;
