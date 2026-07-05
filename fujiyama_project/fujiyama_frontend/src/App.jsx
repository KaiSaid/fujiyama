import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import api from './api';
// ИМПОРТИРУЕМ ЛОГОТИП НАПРЯМУЮ
import logo from './assets/logo.jpg.jpg';
import AdminLayout from './admin/layouts/AdminLayout.jsx';
import AdminLogin from './admin/pages/Login.jsx';
import Dashboard from './admin/pages/Dashboard.jsx';
import Groups from './admin/pages/Groups.jsx';
import Requests from './admin/pages/Requests.jsx';
import StudentsList from './admin/pages/StudentsList.jsx';
import Schedule from './admin/pages/Schedule';
import Competitions from './admin/pages/Competitions';

// --- ВСПОМОГАТЕЛЬНЫЙ КОМПОНЕНТ ДЛЯ ПЛАВНОГО СКРОЛЛА ---
function NavScrollLink({ targetId, children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleClick = (e) => {
    e.preventDefault();
    if (location.pathname !== '/') {
      navigate('/');
      setTimeout(() => document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' }), 100);
    } else {
      document.getElementById(targetId)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <a 
      href={`/#${targetId}`} 
      onClick={handleClick} 
      style={{ textDecoration: 'none', color: '#4b5563', fontWeight: '500', fontSize: '0.95rem', cursor: 'pointer', transition: 'color 0.2s' }} 
      onMouseOver={(e) => e.target.style.color = '#111827'} 
      onMouseOut={(e) => e.target.style.color = '#4b5563'}
    >
      {children}
    </a>
  );
}

// --- НАВИГАЦИЯ ---
function Navbar({ user, onLogout }) {
  const navStyle = {
    position: 'sticky', top: 0, width: '100%', zIndex: 1000,
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '15px 5%',
    backgroundColor: '#ffffff',
    borderBottom: '1px solid #e5e7eb',
    boxSizing: 'border-box'
  };

  return (
    <nav style={navStyle}>
      {/* ЛЕВАЯ ЧАСТЬ: ЭМБЛЕМА И НАЗВАНИЕ */}
      <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '12px', color: '#111827' }}>
        <img 
          src={logo} 
          alt="Dojo Logo" 
          style={{ height: '40px', width: '40px', borderRadius: '50%', objectFit: 'cover' }} 
          onError={(e) => { e.target.style.display = 'none'; console.error("Логотип не найден!"); }} 
        />
        <span style={{ fontWeight: '700', fontSize: '1.25rem', letterSpacing: '-0.02em' }}>Fujiyama</span>
      </Link>
      
      {/* ЦЕНТР: МЕНЮ */}
      <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
        <NavScrollLink targetId="hero">Главная</NavScrollLink>
        <NavScrollLink targetId="about">О нас</NavScrollLink>
        <NavScrollLink targetId="schedule">Расписание</NavScrollLink>
        <NavScrollLink targetId="instructors">Тренеры</NavScrollLink>
        <NavScrollLink targetId="contact">Контакты</NavScrollLink>
      </div>

      {/* ПРАВАЯ ЧАСТЬ: КАБИНЕТ / ВХОД */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        {user && <Link to="/profile" style={{ textDecoration: 'none', color: '#4f46e5', fontWeight: '600', fontSize: '0.95rem' }}>Кабинет</Link>}
        {user ? (
          <button onClick={onLogout} style={{ background: 'none', color: '#6b7280', border: 'none', cursor: 'pointer', fontWeight: '500', fontSize: '0.95rem' }}>
            Выйти
          </button>
        ) : (
          <Link to="/login" style={{ textDecoration: 'none', color: '#111827', fontWeight: '500', fontSize: '0.95rem' }}>
            Войти
          </Link>
        )}
      </div>
    </nav>
  );
}

// --- ПУБЛИЧНЫЙ ЛАЙАУТ (РЕШАЕТ БАГ С НАВБАРОМ) ---
function PublicLayout({ user, onLogout }) {
  return (
    <>
      <Navbar user={user} onLogout={onLogout} />
      <Outlet />
    </>
  );
}

// --- МОДАЛКА «ЗАПИСАТЬСЯ БЕЗ УЧЁТКИ» ---
// Гость оставляет имя и телефон, заявка попадает в CRM,
// администратор перезванивает и договаривается о тренировке.
function EnrollModal({ group, onClose }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');

  const inputStyle = { padding: '12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '1rem', width: '100%', boxSizing: 'border-box' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSending(true);
    try {
      await api.post('trial-requests/', { name, phone, comment, group: group.id });
      setDone(true);
    } catch (err) {
      const data = err.response?.data;
      // Показываем первую осмысленную ошибку сервера (валидация или лимит запросов)
      const firstError = data?.phone?.[0] || data?.name?.[0] || data?.detail;
      setError(firstError || 'Не удалось отправить заявку. Попробуйте позже.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, padding: '20px' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '32px', maxWidth: '420px', width: '100%', border: '1px solid #e5e7eb' }}>
        {done ? (
          <div style={{ textAlign: 'center' }}>
            <h3 style={{ color: '#111827', marginTop: 0 }}>Заявка отправлена!</h3>
            <p style={{ color: '#4b5563', lineHeight: '1.6' }}>
              Мы свяжемся с вами по указанному номеру и подберём удобное время тренировки.
            </p>
            <button onClick={onClose} style={{ backgroundColor: '#111827', color: 'white', border: 'none', padding: '12px 28px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem', marginTop: '10px' }}>
              Закрыть
            </button>
          </div>
        ) : (
          <>
            <h3 style={{ color: '#111827', marginTop: 0, marginBottom: '6px' }}>Запись на тренировку</h3>
            <p style={{ color: '#6b7280', marginTop: 0, marginBottom: '20px', fontSize: '0.95rem' }}>
              {group.name} — оставьте контакты, и мы вам перезвоним.
            </p>
            {error && (
              <p style={{ color: '#dc2626', backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '10px 12px', fontSize: '0.9rem' }}>
                {error}
              </p>
            )}
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <input type="text" placeholder="Ваше имя" value={name} onChange={e => setName(e.target.value)} style={inputStyle} required minLength={2} />
              <input type="tel" placeholder="Телефон, например +7 900 123-45-67" value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} required />
              <textarea placeholder="Комментарий (необязательно)" value={comment} onChange={e => setComment(e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
              <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                <button type="button" onClick={onClose} style={{ flex: 1, backgroundColor: '#f3f4f6', color: '#111827', border: '1px solid #d1d5db', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem' }}>
                  Отмена
                </button>
                <button type="submit" disabled={sending} style={{ flex: 1, backgroundColor: '#4f46e5', color: 'white', border: 'none', padding: '12px', borderRadius: '6px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem', opacity: sending ? 0.7 : 1 }}>
                  {sending ? 'Отправка...' : 'Отправить'}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// --- ГЛАВНАЯ СТРАНИЦА ---
function Home({ user }) {
  const [sections, setSections] = useState([]);
  const [enrollGroup, setEnrollGroup] = useState(null); // группа, на которую записывается гость

  useEffect(() => {
    api.get('sections/')
       .then(res => setSections(res.data))
       .catch(err => console.error("Ошибка загрузки расписания", err));
  }, []);

  const handleEnroll = async (group) => {
    // Гость без учётки оставляет заявку с телефоном — админ перезвонит.
    if (!user) {
      setEnrollGroup(group);
      return;
    }
    // Ученик с учёткой записывается напрямую, как раньше.
    try {
      await api.post('enrollments/', { group: group.id });
      alert("Заявка отправлена! Тренер подтвердит запись.");
    } catch (err) {
      // Показываем причину, которую вернул сервер (например, «уже подали заявку»)
      alert(err.response?.data?.detail || "Ошибка при записи.");
    }
  };

  return (
    <div style={{ backgroundColor: '#ffffff' }}>
      
      {/* 1. HERO СЕКЦИЯ */}
      <section id="hero" style={{ padding: '100px 20px', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        <h1 style={{ display: 'flex', flexDirection: 'column', gap: '35px', fontSize: '3.5rem', fontWeight: '800', margin: '0 0 20px 0', letterSpacing: '-0.03em' }}>
          <span style={{ color: '#111827' }}>Традиции Каратэ в</span>
          <span style={{ color: '#ff0000' }}>Fujiyama</span>
        </h1>
        <p style={{ fontSize: '1.2rem', color: '#4b5563', lineHeight: '1.6', marginBottom: '40px' }}>
          Трансформируйте тело и дух через традиционные тренировки боевых искусств в современном додзё под руководством опытных тренеров.
        </p>
      </section>

      {/* 2. СЕКЦИЯ "О НАС" */}
      <section id="about" style={{ padding: '80px 5%', backgroundColor: '#f9fafb' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '10px', color: '#111827' }}>О нашем Клубе</h2>
        <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '50px' }}>Мы обучаем боевым искусствам более 10 лет, сохраняя традиции и ценности.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '30px', maxWidth: '1200px', margin: '0 auto' }}>
          {[
            { title: "Дисциплина", desc: "Развиваем ментальную силу и фокус через строгие тренировки." },
            { title: "Уважение", desc: "Чтим традиции и ценности боевых искусств на каждом занятии." },
            { title: "Мастерство", desc: "Стремимся к постоянному улучшению техники и характера." }
          ].map((item, i) => (
            <div key={i} style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
              <h3 style={{ color: '#111827', margin: '0 0 10px 0', fontWeight: '700' }}>{item.title}</h3>
              <p style={{ color: '#6b7280', margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. СЕКЦИЯ РАСПИСАНИЯ */}
      <section id="schedule" style={{ padding: '80px 5%', backgroundColor: '#ffffff' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '10px', color: '#111827' }}>Расписание занятий</h2>
        <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '50px' }}>Выберите группу, подходящую для вашего уровня подготовки</p>
        
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'grid', gap: '40px' }}>
          {sections.length === 0 ? (
            <p style={{ textAlign: 'center', color: '#ef4444' }}>Расписание пока недоступно (нет связи с сервером).</p>
          ) : (
            sections.map(section => (
              <div key={section.id}>
                <h3 style={{ fontSize: '1.5rem', color: '#374151', borderBottom: '2px solid #f3f4f6', paddingBottom: '10px', marginBottom: '20px' }}>
                  {section.name}
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
                  {section.groups?.map(group => (
                    <div key={group.id} style={{ padding: '24px', border: '1px solid #e5e7eb', borderRadius: '12px', display: 'flex', flexDirection: 'column' }}>
                      <h4 style={{ margin: '0 0 15px 0', fontSize: '1.1rem', color: '#111827' }}>{group.name}</h4>
                      <div style={{ flexGrow: 1, marginBottom: '20px' }}>
                        {group.schedules?.map(sch => (
                          <div key={sch.id} style={{ fontSize: '0.9rem', color: '#4b5563', padding: '8px 0', borderBottom: '1px solid #f9fafb' }}>
                            <span style={{ fontWeight: '600', width: '100px', display: 'inline-block' }}>{sch.day_display}</span>
                            <span>{sch.start_time.slice(0,5)}</span>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => handleEnroll(group)} style={{ padding: '12px', borderRadius: '6px', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', color: '#111827', cursor: 'pointer', fontWeight: '600', transition: '0.2s' }} onMouseOver={(e) => e.target.style.backgroundColor = '#e5e7eb'} onMouseOut={(e) => e.target.style.backgroundColor = '#f3f4f6'}>
                        Записаться
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* --- СЕКЦИЯ ТРЕНЕРЫ --- */}
      <section id="instructors" style={{ padding: '80px 5%', backgroundColor: '#ffffff', color: '#000000' }}>
        <h2 style={{ textAlign: 'center', color: '#000000', fontSize: '2.5rem', marginBottom: '10px' }}>Наши наставники</h2>
        <p style={{ textAlign: 'center', color: '#6b7280', marginBottom: '50px' }}>Мастера с многолетним опытом преподавания</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', maxWidth: '1000px', margin: '0 auto' }}>
          {/* ТРЕНЕР АНДРЕЙ */}
          <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '16px', border: '1px solid #e5e7eb', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '5px', fontWeight: '700' }}>Андрей</h3>
            <p style={{ color: '#ff0000', fontWeight: '700', marginBottom: '15px', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '0.05em' }}>
              Сэнсэй (1 Дан)
            </p>
            <p style={{ color: '#4b5563', lineHeight: '1.6' }}>
              Основатель клуба. Более 25 лет в каратэ.
            </p>
          </div>

          {/* ТРЕНЕР КИРИЛЛ */}
          <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '16px', border: '1px solid #e5e7eb', textAlign: 'center', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '5px', fontWeight: '700' }}>Кирилл</h3>
            <p style={{ color: '#ff0000', fontWeight: '700', marginBottom: '15px', textTransform: 'uppercase', fontSize: '0.9rem', letterSpacing: '0.05em' }}>
              Сэмпай (3 Кю)
            </p>
            <p style={{ color: '#4b5563', lineHeight: '1.6' }}>
              Ведет детские группы.
            </p>
          </div>
        </div>
      </section>

      {/* 4. СЕКЦИЯ КОНТАКТОВ */}
      <section id="contact" style={{ padding: '80px 5%', backgroundColor: '#f9fafb' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '40px', color: '#111827' }}>Ждем вас на тренировках</h2>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', padding: '40px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <p style={{ fontSize: '1.2rem', color: '#374151', margin: '10px 0' }}><strong>Адрес:</strong> ул. Главная, 123, Спортивный комплекс</p>
          <p style={{ fontSize: '1.2rem', color: '#374151', margin: '10px 0' }}><strong>Телефон:</strong> +7 (999) 123-45-67</p>
          <p style={{ fontSize: '1.2rem', color: '#374151', margin: '10px 0' }}><strong>Email:</strong> dojo@fujiyama.com</p>
        </div>
      </section>

      {/* Модалка записи для гостей без учётной записи */}
      {enrollGroup && <EnrollModal group={enrollGroup} onClose={() => setEnrollGroup(null)} />}

    </div>
  );
}

// --- СТРАНИЦА ВХОДА ---
function LoginPage({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('token/', { username, password });
      
      // Сохраняем ключи авторизации
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      // СИНХРОНИЗИРУЕМ КЛЮЧ ТОКЕНА ДЛЯ ПАНЕЛИ АДМИНИСТРАТОРА
      localStorage.setItem('token', res.data.access);
      
      onLoginSuccess(username);
      navigate('/profile');
    } catch {
      alert("Ошибка входа! Проверь логин и пароль.");
    }
  };

  return (
    <div style={{ padding: '80px 20px', minHeight: 'calc(100vh - 70px)', backgroundColor: '#f9fafb', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
      <div style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '12px', border: '1px solid #e5e7eb', maxWidth: '400px', width: '100%', marginTop: '40px' }}>
        <h2 style={{ color: '#111827', textAlign: 'center', marginBottom: '24px' }}>Вход в Клуб</h2>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <input type="text" placeholder="Логин" value={username} onChange={e => setUsername(e.target.value)} style={{ padding: '12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '1rem' }} required />
          <input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} style={{ padding: '12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '1rem' }} required />
          <button type="submit" style={{ backgroundColor: '#4f46e5', color: 'white', border: 'none', padding: '14px', cursor: 'pointer', fontWeight: '600', borderRadius: '6px', fontSize: '1rem', marginTop: '10px' }}>Войти</button>
        </form>
      </div>
    </div>
  );
}

// --- ЛИЧНЫЙ КАБИНЕТ (ИСПРАВЛЕНЫ ОШИБКИ ЗАВИСАНИЯ И 404) ---
function ProfilePage() {
  // loading уже true при монтировании — эффект выполняет только запрос
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    api.get('profile-data/')
       .then(res => {
         setData(res.data);
         // ЕСЛИ ЭТО АДМИН/ПЕРСОНАЛ — СРАЗУ РЕДИРЕКТИМ В НАШУ КРАСИВУЮ CRM
         if (res.data.is_staff || res.data.is_superuser) {
           navigate('/admin/students');
         }
       })
       .catch(err => {
         console.error("Ошибка получения профиля:", err);
         setError("Профиль не найден или у вас права администратора.");
       })
       .finally(() => {
         setLoading(false);
       });
  }, [navigate]);

  // Если бэкенд отдал 404 для админа — даем ему кнопку явного перехода в CRM панели управления
  if (error) {
    return (
      <div style={{ padding: '80px 5%', textAlign: 'center', backgroundColor: '#f9fafb', minHeight: 'calc(100vh - 70px)' }}>
        <div style={{ maxWidth: '500px', margin: '0 auto', backgroundColor: 'white', padding: '40px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <h3 style={{ color: '#111827', marginBottom: '10px' }}>Доступ к панели управления</h3>
          <p style={{ color: '#6b7280', marginBottom: '25px', fontSize: '0.95rem' }}>Данные обычного ученика отсутствуют. Перейдите в административный интерфейс.</p>
          <Link to="/admin/students" style={{ display: 'inline-block', backgroundColor: '#4f46e5', color: 'white', padding: '12px 24px', borderRadius: '6px', textDecoration: 'none', fontWeight: '600', fontSize: '0.95rem' }}>
            Открыть Панель Учеников
          </Link>
        </div>
      </div>
    );
  }

  if (loading) return <div style={{ padding: '100px', textAlign: 'center', color: '#6b7280', fontSize: '1.1rem' }}>Загрузка профиля...</div>;
  if (!data) return null;

  const isAdmin = data.is_staff === true; 

  return (
    <div style={{ padding: '60px 5%', backgroundColor: '#f9fafb', minHeight: 'calc(100vh - 70px)' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '10px', color: '#111827' }}>
          {data.first_name || data.username}
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '30px', fontWeight: '500' }}>
          {isAdmin ? 'Режим: Администратор' : 'Режим: Ученик'}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          
          <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#111827' }}>Контактные данные</h3>
            <p style={{ margin: '8px 0' }}><strong>Логин:</strong> {data.username}</p>
            <p style={{ margin: '8px 0' }}><strong>Email:</strong> {data.email || 'не указан'}</p>
            
            {isAdmin && (
              <Link 
                to="/admin/students" 
                style={{ 
                  display: 'inline-block', 
                  marginTop: '15px', 
                  color: 'white', 
                  backgroundColor: '#111827', 
                  padding: '10px 20px', 
                  borderRadius: '6px', 
                  textDecoration: 'none',
                  fontSize: '0.9rem',
                  fontWeight: '500'
                }}
              >
                Панель управления CRM →
              </Link>
            )}
          </div>

          {!isAdmin && (
            <>
              <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#4f46e5' }}>Боевой статус</h3>
                <p style={{ margin: '8px 0' }}>
                  <strong>Пояс:</strong> {data.belt_level || 'Белый'} {data.kyu ? `(${data.kyu} Кю/Дан)` : ''}
                </p>
              </div>

              <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                <h3 style={{ margin: '0 0 15px 0', color: '#4f46e5' }}>Статистика</h3>
                <p style={{ margin: '8px 0' }}><strong>Посещено тренировок:</strong> {data.attendances?.length || 0}</p>
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}

// --- MAIN APP ---
function App() {
  const [user, setUser] = useState(localStorage.getItem('username') || null);
  
  const loginSuccess = (name) => { 
    localStorage.setItem('username', name); 
    setUser(name); 
  };
  
  const logout = () => { 
    localStorage.clear(); 
    setUser(null); 
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#ffffff', fontFamily: '"Inter", -apple-system, sans-serif' }}>
      <BrowserRouter>
        <Routes>
          
          {/* ВСЕ ПУБЛИЧНЫЕ РОУТЫ С НАВБАРОМ */}
          <Route path="/" element={<PublicLayout user={user} onLogout={logout} />}>
            <Route index element={<Home user={user} />} />
            <Route path="login" element={<LoginPage onLoginSuccess={loginSuccess} />} />
            <Route path="profile" element={<ProfilePage />} />
          </Route>

          {/* АДМИНИСТРАТИВНАЯ ПАНЕЛЬ CRM */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<Dashboard />} />
            <Route path="requests" element={<Requests />} />
            <Route path="students" element={<StudentsList />} />
            <Route path="groups" element={<Groups />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="competitions" element={<Competitions />} />
          </Route>

        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;