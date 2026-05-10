import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import api from './api';
// ИМПОРТИРУЕМ ЛОГОТИП НАПРЯМУЮ (убедись, что файл лежит в src/assets/logo.jpg)
import logo from './assets/logo.jpg.jpg';

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
    <a href={`/#${targetId}`} onClick={handleClick} style={{ textDecoration: 'none', color: '#4b5563', fontWeight: '500', fontSize: '0.95rem', cursor: 'pointer', transition: 'color 0.2s' }} onMouseOver={(e) => e.target.style.color = '#111827'} onMouseOut={(e) => e.target.style.color = '#4b5563'}>
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
        {/* ИСПОЛЬЗУЕМ ИМПОРТИРОВАННУЮ КАРТИНКУ */}
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

// --- ГЛАВНАЯ СТРАНИЦА ---
function Home({ user }) {
  const [sections, setSections] = useState([]);

  useEffect(() => {
    api.get('sections/')
       .then(res => setSections(res.data))
       .catch(err => console.error("Ошибка загрузки расписания", err));
  }, []);

  const handleEnroll = async (groupId) => {
    if (!user) { alert("Сначала нужно войти в систему!"); return; }
    try {
      await api.post('enrollments/', { group: groupId });
      alert("Успешно записаны!");
    } catch (err) { alert("Ошибка при записи."); }
  };

  return (
    <div style={{ backgroundColor: '#ffffff' }}>
      
      {/* 1. HERO СЕКЦИЯ */}
      <section id="hero" style={{ padding: '100px 20px', textAlign: 'center', maxWidth: '800px', margin: '0 auto' }}>
        {/* Увеличили gap с 10px до 35px, чтобы опустить красную надпись ниже */}
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
            { icon: '🥋', t: "Дисциплина", d: "Развиваем ментальную силу и фокус через строгие тренировки." },
            { icon: '🤝', t: "Уважение", d: "Чтим традиции и ценности боевых искусств на каждом занятии." },
            { icon: '⭐', t: "Мастерство", d: "Стремимся к постоянному улучшению техники и характера." }
          ].map((item, i) => (
            <div key={i} style={{ backgroundColor: '#ffffff', padding: '30px', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'center' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '15px' }}>{item.icon}</div>
              <h3 style={{ color: '#111827', margin: '0 0 10px 0' }}>{item.t}</h3>
              <p style={{ color: '#6b7280', margin: 0 }}>{item.d}</p>
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
                      <button onClick={() => handleEnroll(group.id)} style={{ padding: '12px', borderRadius: '6px', backgroundColor: '#f3f4f6', border: '1px solid #d1d5db', color: '#111827', cursor: 'pointer', fontWeight: '600', transition: '0.2s' }} onMouseOver={(e) => e.target.style.backgroundColor = '#e5e7eb'} onMouseOut={(e) => e.target.style.backgroundColor = '#f3f4f6'}>
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

      {/* 4. СЕКЦИЯ КОНТАКТОВ */}
      <section id="contact" style={{ padding: '80px 5%', backgroundColor: '#f9fafb' }}>
        <h2 style={{ textAlign: 'center', fontSize: '2.5rem', marginBottom: '40px', color: '#111827' }}>Ждем вас на тренировках</h2>
        <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', padding: '40px', backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <p style={{ fontSize: '1.2rem', color: '#374151', margin: '10px 0' }}><strong>📍 Адрес:</strong> ул. Главная, 123, Спортивный комплекс</p>
          <p style={{ fontSize: '1.2rem', color: '#374151', margin: '10px 0' }}><strong>📞 Телефон:</strong> +7 (999) 123-45-67</p>
          <p style={{ fontSize: '1.2rem', color: '#374151', margin: '10px 0' }}><strong>✉️ Email:</strong> dojo@fujiyama.com</p>
        </div>
      </section>

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
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      onLoginSuccess(username);
      navigate('/profile');
    } catch (err) {
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

// --- ЛИЧНЫЙ КАБИНЕТ ---
function ProfilePage({ user }) {
  const [data, setData] = useState(null);
  
  useEffect(() => { 
    api.get('profile-data/')
       .then(res => setData(res.data))
       .catch(err => console.error(err));
  }, []);

  if (!data) return <div style={{ padding: '100px', textAlign: 'center', color: '#6b7280' }}>Загрузка профиля...</div>;

  // Определяем, является ли пользователь администратором
  // Django возвращает is_staff для суперпользователей и персонала
  const isAdmin = data.is_staff === true; 

  return (
    <div style={{ padding: '60px 5%', backgroundColor: '#f9fafb', minHeight: 'calc(100vh - 70px)' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        <h1 style={{ marginBottom: '10px', color: '#111827' }}>
          {data.first_name || data.username}
        </h1>
        <p style={{ color: '#6b7280', marginBottom: '30px', fontWeight: '500' }}>
          {isAdmin ? '🛡️ Режим: Администратор' : '🥋 Режим: Ученик'}
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
          
          {/* ОБЩАЯ ИНФОРМАЦИЯ — видна всем */}
          <div style={{ padding: '24px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#111827' }}>Контактные данные</h3>
            <p style={{ margin: '8px 0' }}><strong>Логин:</strong> {data.username}</p>
            <p style={{ margin: '8px 0' }}><strong>Email:</strong> {data.email || 'не указан'}</p>
            
            {/* Кнопка входа в админку только для персонала */}
            {isAdmin && (
              <a 
                href="http://127.0.0.1:8000/admin/" 
                target="_blank" 
                rel="noreferrer"
                style={{ 
                  display: 'inline-block', 
                  marginTop: '15px', 
                  color: 'white', 
                  backgroundColor: '#111827', 
                  padding: '10px 20px', 
                  borderRadius: '6px', 
                  textDecoration: 'none',
                  fontSize: '0.9rem'
                }}
              >
                Панель управления Django →
              </a>
            )}
          </div>

          {/* БЛОКИ ТОЛЬКО ДЛЯ УЧЕНИКОВ — скрываются, если isAdmin === true */}
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
        <Navbar user={user} onLogout={logout} />
        <Routes>
          <Route path="/" element={<Home user={user} />} />
          <Route path="/login" element={<LoginPage onLoginSuccess={loginSuccess} />} />
          <Route path="/profile" element={<ProfilePage user={user} />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;