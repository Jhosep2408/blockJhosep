import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ChartBarIcon,
  ClipboardDocumentListIcon,
  CheckCircleIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  UserCircleIcon,
  BellIcon,
  Cog6ToothIcon,
  SunIcon,
  MoonIcon,
  CalendarIcon,
  ExclamationCircleIcon
} from '@heroicons/react/24/outline';
import api, { importantDatesApi } from '../../services/api';
import NoteList from '../notes/NoteList';
import TaskList from '../tasks/TaskList';
import CreateNoteModal from '../notes/CreateNoteModal';
import CreateTaskModal from '../tasks/CreateTaskModal';
import ProfileDropdown from "../profile/ProfileDropdown";
import ProfileModal from "../profile/ProfileModal";
import { useSettings } from '../../contexts/SettingsContext';
import SettingsModal from '../settings/SettingsModal';
import ImportantDatesModal from '../dates/ImportantDatesModal';
import CreateImportantDateModal from '../dates/CreateImportantDateModal';

const Dashboard = () => {
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const { t, settings, toggleTheme } = useSettings();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({
    totalNotes: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    overdueTasks: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showImportantDatesModal, setShowImportantDatesModal] = useState(false);
  const [showCreateDateModal, setShowCreateDateModal] = useState(false);
  const [upcomingDates, setUpcomingDates] = useState([]);
  const [datesLoading, setDatesLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('notes');
  const navigate = useNavigate();

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/login');
      return;
    }

    setUser(JSON.parse(userData));
    fetchDashboardData();
    fetchUpcomingDates();

    const interval = setInterval(() => {
      fetchDashboardData();
      fetchUpcomingDates();
    }, 30000);
    return () => clearInterval(interval);
  }, [navigate]);

  const fetchDashboardData = async () => {
    try {
      const [notesRes, tasksRes] = await Promise.all([
        api.get('/notes?per_page=5'),
        api.get('/tasks?per_page=10')
      ]);

      const notes = notesRes.data.data || [];
      const tasks = tasksRes.data.data || [];
      const today = new Date().toISOString().split('T')[0];

      const completedTasks = tasks.filter(task => task.status === 'completada').length;
      const pendingTasks = tasks.filter(task => task.status !== 'completada').length;
      const overdueTasks = tasks.filter(task =>
        task.status !== 'completada' &&
        task.due_date < today
      ).length;

      setStats({
        totalNotes: notesRes.data.total || 0,
        totalTasks: tasksRes.data.total || 0,
        completedTasks,
        pendingTasks,
        overdueTasks
      });

      const activity = [
        ...notes.slice(0, 3).map(note => ({
          id: `note-${note.id}`,
          type: 'note',
          action: note.created_at === note.updated_at ? t('created') : t('updated'),
          title: note.title,
          time: note.updated_at,
          priority: note.priority
        })),
        ...tasks.slice(0, 3).map(task => ({
          id: `task-${task.id}`,
          type: 'task',
          action: task.status === 'completada' ? t('completed') : t('created'),
          title: task.title,
          time: task.updated_at,
          status: task.status
        }))
      ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

      setRecentActivity(activity);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchUpcomingDates = async () => {
    try {
      setDatesLoading(true);
      const response = await importantDatesApi.getUpcoming(7);

      // La respuesta debería tener response.data.data
      if (response.data && response.data.data) {
        setUpcomingDates(response.data.data);
      } else {
        // Si la estructura es diferente, ajusta aquí
        setUpcomingDates(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching upcoming dates:', error);
      // No mostrar error si es 404 - el backend aún no está listo
      if (error.response && error.response.status !== 404) {
        console.error('Error específico:', error.response.data);
      }
      setUpcomingDates([]); // Vaciar array en caso de error
    } finally {
      setDatesLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.post('/logout');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'alta': return '🔴';
      case 'media': return '🟡';
      case 'baja': return '🟢';
      default: return '⚪';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completada': return '✅';
      case 'en_progreso': return '🔄';
      case 'pendiente': return '⏳';
      default: return '📝';
    }
  };

  const formatTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (settings.language === 'en') {
      if (diffMins < 60) {
        return `${diffMins} min ago`;
      } else if (diffHours < 24) {
        return `${diffHours} h ago`;
      } else if (diffDays < 7) {
        return `${diffDays} d ago`;
      } else {
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      }
    } else {
      if (diffMins < 60) {
        return `hace ${diffMins} min`;
      } else if (diffHours < 24) {
        return `hace ${diffHours} h`;
      } else if (diffDays < 7) {
        return `hace ${diffDays} d`;
      } else {
        return date.toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
      }
    }
  };

  const formatDate = () => {
    const options = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    };

    if (settings.language === 'en') {
      return new Date().toLocaleDateString('en-US', options);
    } else {
      return new Date().toLocaleDateString('es-ES', options);
    }
  };

  const calculateCompletionRate = () => {
    if (stats.totalTasks === 0) return '0%';
    return `${Math.round((stats.completedTasks / stats.totalTasks) * 100)}%`;
  };

  const handleDateSaved = () => {
    fetchUpcomingDates();
    setShowCreateDateModal(false);
  };

  // Colores para los niveles de importancia
  const importanceColors = {
    baja: 'bg-green-500',
    media: 'bg-yellow-500',
    alta: 'bg-red-500',
    muy_alta: 'bg-red-700'
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 pb-16 md:pb-0">
      {/* Top Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">NF</span>
                </div>
                <span className="ml-2 text-lg md:text-xl font-bold text-gray-800 dark:text-white">NotaFlow</span>
              </div>
            </div>

            <div className="flex items-center space-x-2 md:space-x-4">
              <button
                onClick={toggleTheme}
                className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                title={settings.theme === 'dark' ? t('lightMode') : t('darkMode')}
              >
                {settings.theme === 'dark' ? (
                  <SunIcon className="h-5 w-5 md:h-6 md:w-6" />
                ) : (
                  <MoonIcon className="h-5 w-5 md:h-6 md:w-6" />
                )}
              </button>

              <button className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200">
                <BellIcon className="h-5 w-5 md:h-6 md:w-6" />
              </button>

              <button
                onClick={() => setShowSettingsModal(true)}
                className="p-2 text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
              >
                <Cog6ToothIcon className="h-5 w-5 md:h-6 md:w-6" />
              </button>

              <ProfileDropdown
                user={user}
                onLogout={handleLogout}
                onProfileClick={() => setShowProfileModal(true)}
                onSettingsClick={() => setShowSettingsModal(true)}
              />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content - Scrollable area */}
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 md:py-6 overflow-y-auto">
        {/* Welcome Header */}
        <div className="mb-6 md:mb-8 px-1">
          <h1 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white">
            {t('welcome')}, {user?.name?.split(' ')[0] || t('user')}!
          </h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 mt-1 md:mt-2">
            {formatDate()}
          </p>
        </div>

        {/* Stats Cards - 2 columns on mobile, 4 on desktop */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8 px-1">
          {/* Total Notes Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg md:rounded-xl shadow-sm p-3 md:p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <div className="flex items-center justify-between mb-2 md:mb-4">
              <div className="p-2 md:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <ClipboardDocumentListIcon className="h-4 w-4 md:h-6 md:w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <span className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">{t('total')}</span>
            </div>
            <div className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white">{stats.totalNotes}</div>
            <p className="text-xs md:text-base text-gray-600 dark:text-gray-400 mt-1">{t('notes')}</p>
            <div className="mt-2 md:mt-4 flex items-center text-xs md:text-sm">
              <ArrowTrendingUpIcon className="h-3 w-3 md:h-4 md:w-4 text-green-500 mr-1" />
              <span className="text-green-600 dark:text-green-400">+12% {t('thisMonth')}</span>
            </div>
          </div>

          {/* Completed Tasks Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg md:rounded-xl shadow-sm p-3 md:p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <div className="flex items-center justify-between mb-2 md:mb-4">
              <div className="p-2 md:p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <CheckCircleIcon className="h-4 w-4 md:h-6 md:w-6 text-green-600 dark:text-green-400" />
              </div>
              <span className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">{t('completed')}</span>
            </div>
            <div className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white">{stats.completedTasks}</div>
            <p className="text-xs md:text-base text-gray-600 dark:text-gray-400 mt-1">{t('tasks')}</p>
            <div className="mt-2 md:mt-4 flex items-center text-xs md:text-sm">
              {stats.completedTasks > 0 ? (
                <>
                  <ArrowTrendingUpIcon className="h-3 w-3 md:h-4 md:w-4 text-green-500 mr-1" />
                  <span className="text-green-600 dark:text-green-400">
                    {calculateCompletionRate()} {t('completed')}
                  </span>
                </>
              ) : (
                <span className="text-gray-500 dark:text-gray-400 text-xs">{t('noCompletedTasks')}</span>
              )}
            </div>
          </div>

          {/* Pending Tasks Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg md:rounded-xl shadow-sm p-3 md:p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <div className="flex items-center justify-between mb-2 md:mb-4">
              <div className="p-2 md:p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <ChartBarIcon className="h-4 w-4 md:h-6 md:w-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <span className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">{t('pending')}</span>
            </div>
            <div className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white">{stats.pendingTasks}</div>
            <p className="text-xs md:text-base text-gray-600 dark:text-gray-400 mt-1">{t('tasks')}</p>
            <div className="mt-2 md:mt-4 flex items-center text-xs md:text-sm">
              <ArrowTrendingDownIcon className="h-3 w-3 md:h-4 md:w-4 text-yellow-500 mr-1" />
              <span className="text-yellow-600 dark:text-yellow-400">{t('needAttention')}</span>
            </div>
          </div>

          {/* Overdue Tasks Card */}
          <div className="bg-white dark:bg-gray-800 rounded-lg md:rounded-xl shadow-sm p-3 md:p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <div className="flex items-center justify-between mb-2 md:mb-4">
              <div className="p-2 md:p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <BellIcon className="h-4 w-4 md:h-6 md:w-6 text-red-600 dark:text-red-400" />
              </div>
              <span className="text-xs md:text-sm font-medium text-gray-500 dark:text-gray-400">{t('overdue')}</span>
            </div>
            <div className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white">{stats.overdueTasks}</div>
            <p className="text-xs md:text-base text-gray-600 dark:text-gray-400 mt-1">{t('tasks')}</p>
            <div className="mt-2 md:mt-4 flex items-center text-xs md:text-sm">
              <span className={`${stats.overdueTasks > 0 ? 'text-red-600 dark:text-red-400' : 'text-gray-500 dark:text-gray-400'}`}>
                {stats.overdueTasks > 0 ? t('urgentAttention') : t('allUpToDate')}
              </span>
            </div>
          </div>
        </div>

        {/* Important Dates Card - NUEVA SECCIÓN */}
        <div className="mb-6 md:mb-8 px-1">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-lg p-4 md:p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between">
              <div className="flex items-center mb-4 md:mb-0">
                <div className="p-2 bg-white/20 rounded-lg mr-3">
                  <ExclamationCircleIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-bold text-white">
                    {t('importantDates')}
                  </h3>
                  <p className="text-white/80 text-sm mt-1">
                    {datesLoading
                      ? t('loading') + '...'
                      : upcomingDates.length > 0
                        ? `${upcomingDates.length} ${t('upcomingDates').toLowerCase()}`
                        : t('noImportantDates')
                    }
                  </p>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setShowImportantDatesModal(true)}
                  className="px-4 py-2 bg-white text-purple-600 font-medium rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-600 transition-colors"
                >
                  <div className="flex items-center">
                    <CalendarIcon className="h-4 w-4 mr-2" />
                    {t('viewImportantDates')}
                  </div>
                </button>

                <button
                  onClick={() => setShowCreateDateModal(true)}
                  className="px-4 py-2 bg-white/20 text-white font-medium rounded-lg border border-white/30 hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-purple-600 transition-colors"
                >
                  <div className="flex items-center">
                    <span className="text-lg mr-1">+</span>
                    {t('addNewDate')}
                  </div>
                </button>
              </div>
            </div>

            {/* Mini lista de próximas fechas */}
            {!datesLoading && upcomingDates.length > 0 && (
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {upcomingDates.slice(0, 3).map((date) => {
                  const dateObj = new Date(date.date);
                  const formattedDate = dateObj.toLocaleDateString(
                    settings.language === 'en' ? 'en-US' : 'es-ES',
                    { weekday: 'short', month: 'short', day: 'numeric' }
                  );
                  const daysUntil = Math.ceil((dateObj - new Date()) / (1000 * 60 * 60 * 24));

                  return (
                    <div
                      key={date.id}
                      className="bg-white/10 backdrop-blur-sm rounded-lg p-3 hover:bg-white/15 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium text-white text-sm truncate">
                            {date.title}
                          </h4>
                          <p className="text-white/70 text-xs mt-1">
                            {formattedDate}
                          </p>
                          {daysUntil >= 0 && (
                            <p className="text-white/60 text-xs mt-1">
                              {daysUntil === 0
                                ? t('today')
                                : daysUntil === 1
                                  ? t('tomorrow')
                                  : `En ${daysUntil} días`
                              }
                            </p>
                          )}
                        </div>
                        <div className={`h-3 w-3 rounded-full ${importanceColors[date.importance] || 'bg-gray-400'}`} />
                      </div>
                      {date.has_alarm && (
                        <div className="flex items-center mt-2 text-white/70">
                          <BellIcon className="h-3 w-3 mr-1" />
                          <span className="text-xs">Alarma activada</span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

          </div>
        </div>

        {/* Recent Activity and Quick Actions - Side by side on mobile, stacked on desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-6 md:mb-8">
          {/* Recent Activity */}
          <div className="md:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-lg md:rounded-xl shadow-sm p-4 md:p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
              <div className="flex items-center justify-between mb-4 md:mb-6">
                <h2 className="text-base md:text-xl font-bold text-gray-900 dark:text-white">{t('recentActivity')}</h2>
                <button className="text-xs md:text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium">
                  {t('viewAll')}
                </button>
              </div>

              <div className="space-y-3 md:space-y-4">
                {recentActivity.length === 0 ? (
                  <div className="text-center py-4 md:py-8">
                    <p className="text-gray-500 dark:text-gray-400 text-xs md:text-base">{t('noRecentActivity')}</p>
                  </div>
                ) : (
                  recentActivity.map((activity) => (
                    <div key={activity.id} className="flex items-center p-2 md:p-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg transition duration-200">
                      <div className="flex-shrink-0 mr-2 md:mr-4">
                        <div className={`h-7 w-7 md:h-10 md:w-10 rounded-full flex items-center justify-center ${activity.type === 'note'
                            ? 'bg-blue-100 dark:bg-blue-900/30'
                            : 'bg-green-100 dark:bg-green-900/30'
                          }`}>
                          <span className="text-xs md:text-lg">
                            {activity.type === 'note' ? getPriorityIcon(activity.priority) : getStatusIcon(activity.status)}
                          </span>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs md:text-sm font-medium text-gray-900 dark:text-white truncate">
                          {activity.title}
                        </p>
                        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">
                          {activity.type === 'note' ? t('note') : t('task')} {activity.action}
                        </p>
                      </div>
                      <div className="flex-shrink-0 ml-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatTimeAgo(activity.time)}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white dark:bg-gray-800 rounded-lg md:rounded-xl shadow-sm p-4 md:p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
            <h2 className="text-base md:text-xl font-bold text-gray-900 dark:text-white mb-4 md:mb-6">{t('quickActions')}</h2>

            <div className="space-y-3 md:space-y-4">
              <button
                onClick={() => setShowNoteModal(true)}
                className="w-full flex items-center justify-between p-2 md:p-4 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition duration-200 group"
              >
                <div className="flex items-center">
                  <div className="p-1.5 md:p-2 bg-blue-100 dark:bg-blue-800 rounded-lg mr-2 md:mr-3 group-hover:bg-blue-200 dark:group-hover:bg-blue-700 transition duration-200">
                    <ClipboardDocumentListIcon className="h-4 w-4 md:h-5 md:w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm md:text-base font-medium text-gray-900 dark:text-white">{t('newNote')}</p>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">{t('captureIdea')}</p>
                  </div>
                </div>
                <span className="text-blue-600 dark:text-blue-400 text-lg">+</span>
              </button>

              <button
                onClick={() => setShowTaskModal(true)}
                className="w-full flex items-center justify-between p-2 md:p-4 bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition duration-200 group"
              >
                <div className="flex items-center">
                  <div className="p-1.5 md:p-2 bg-green-100 dark:bg-green-800 rounded-lg mr-2 md:mr-3 group-hover:bg-green-200 dark:group-hover:bg-green-700 transition duration-200">
                    <CheckCircleIcon className="h-4 w-4 md:h-5 md:w-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm md:text-base font-medium text-gray-900 dark:text-white">{t('newTask')}</p>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">{t('addTask')}</p>
                  </div>
                </div>
                <span className="text-green-600 dark:text-green-400 text-lg">+</span>
              </button>

              <button
                onClick={() => setShowImportantDatesModal(true)}
                className="w-full flex items-center justify-between p-2 md:p-4 bg-purple-50 dark:bg-purple-900/20 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded-lg transition duration-200 group"
              >
                <div className="flex items-center">
                  <div className="p-1.5 md:p-2 bg-purple-100 dark:bg-purple-800 rounded-lg mr-2 md:mr-3 group-hover:bg-purple-200 dark:group-hover:bg-purple-700 transition duration-200">
                    <CalendarIcon className="h-4 w-4 md:h-5 md:w-5 text-purple-600 dark:text-purple-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm md:text-base font-medium text-gray-900 dark:text-white">{t('importantDates')}</p>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">Ver y gestionar fechas</p>
                  </div>
                </div>
                <span className="text-purple-600 dark:text-purple-400 text-lg">📅</span>
              </button>

              <button
                onClick={() => setShowProfileModal(true)}
                className="w-full flex items-center justify-between p-2 md:p-4 bg-orange-50 dark:bg-orange-900/20 hover:bg-orange-100 dark:hover:bg-orange-900/30 rounded-lg transition duration-200 group"
              >
                <div className="flex items-center">
                  <div className="p-1.5 md:p-2 bg-orange-100 dark:bg-orange-800 rounded-lg mr-2 md:mr-3 group-hover:bg-orange-200 dark:group-hover:bg-orange-700 transition duration-200">
                    <UserCircleIcon className="h-4 w-4 md:h-5 md:w-5 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm md:text-base font-medium text-gray-900 dark:text-white">{t('profile')}</p>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400">{t('editProfile')}</p>
                  </div>
                </div>
                <span className="text-orange-600 dark:text-orange-400 text-lg">→</span>
              </button>
            </div>

            <div className="mt-6 md:mt-8 pt-4 md:pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2 md:mb-3">{t('dayTip')}</h3>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3 md:p-4">
                <p className="text-xs md:text-sm text-blue-800 dark:text-blue-300">
                  {t('tipContent')}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Section Toggle Buttons - Desktop */}
        <div className="hidden md:flex justify-center mb-6">
          <div className="inline-flex rounded-lg border border-gray-200 dark:border-gray-700 p-1 bg-white dark:bg-gray-800 shadow-sm">
            <button
              onClick={() => setActiveSection('notes')}
              className={`px-6 py-3 text-sm font-medium rounded-md transition-all duration-200 ${activeSection === 'notes'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                }`}
            >
              <div className="flex items-center">
                <ClipboardDocumentListIcon className="h-5 w-5 mr-2" />
                {t('myNotes')}
              </div>
            </button>
            <button
              onClick={() => setActiveSection('tasks')}
              className={`px-6 py-3 text-sm font-medium rounded-md transition-all duration-200 ${activeSection === 'tasks'
                  ? 'bg-green-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300'
                }`}
            >
              <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 mr-2" />
                {t('myTasks')}
              </div>
            </button>
          </div>
        </div>

        {/* Content Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg md:rounded-xl shadow-sm p-4 md:p-6 border border-gray-200 dark:border-gray-700 transition-colors duration-200">
          <div className="flex items-center justify-between mb-4 md:mb-6">
            <h2 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">
              {activeSection === 'notes' ? t('myNotes') : t('myTasks')}
            </h2>
            <button
              onClick={() => activeSection === 'notes' ? setShowNoteModal(true) : setShowTaskModal(true)}
              className={`inline-flex items-center px-3 py-1.5 md:px-4 md:py-2 text-white text-xs md:text-sm font-medium rounded-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800 transition duration-200 ${activeSection === 'notes'
                  ? 'bg-blue-600 focus:ring-blue-500'
                  : 'bg-green-600 focus:ring-green-500'
                }`}
            >
              {activeSection === 'notes' ? (
                <>
                  <ClipboardDocumentListIcon className="h-3 w-3 md:h-5 md:w-5 mr-1 md:mr-2" />
                  <span className="hidden md:inline">{t('newNote')}</span>
                  <span className="md:hidden">+</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-3 w-3 md:h-5 md:w-5 mr-1 md:mr-2" />
                  <span className="hidden md:inline">{t('newTask')}</span>
                  <span className="md:hidden">+</span>
                </>
              )}
            </button>
          </div>

          <div className="h-[calc(100vh-450px)] md:h-[500px] overflow-y-auto">
            {activeSection === 'notes' ? (
              <div className="px-1">
                <NoteList />
              </div>
            ) : (
              <div className="px-1">
                <TaskList onTaskUpdate={fetchDashboardData} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Bar - Fixed at bottom */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 shadow-lg md:hidden z-50">
        <div className="flex justify-around items-center h-16">
          <button
            onClick={() => setActiveSection('notes')}
            className={`flex flex-col items-center justify-center w-full h-full transition-all duration-200 ${activeSection === 'notes'
                ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                : 'text-gray-600 dark:text-gray-400'
              }`}
          >
            <ClipboardDocumentListIcon className={`h-6 w-6 ${activeSection === 'notes' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`} />
            <span className="text-xs mt-1 font-medium">{t('notes')}</span>
          </button>

          <div className="w-px h-8 bg-gray-200 dark:bg-gray-700"></div>

          <button
            onClick={() => setActiveSection('tasks')}
            className={`flex flex-col items-center justify-center w-full h-full transition-all duration-200 ${activeSection === 'tasks'
                ? 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20'
                : 'text-gray-600 dark:text-gray-400'
              }`}
          >
            <CheckCircleIcon className={`h-6 w-6 ${activeSection === 'tasks' ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-gray-500'}`} />
            <span className="text-xs mt-1 font-medium">{t('tasks')}</span>
          </button>
        </div>
      </div>

      {/* Modals */}
      {showProfileModal && (
        <ProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          user={user}
          onProfileUpdate={(updatedUser) => {
            setUser(updatedUser);
            fetchDashboardData();
          }}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
        />
      )}

      {showNoteModal && (
        <CreateNoteModal
          onClose={() => setShowNoteModal(false)}
          onSuccess={() => {
            setShowNoteModal(false);
            fetchDashboardData();
          }}
        />
      )}

      {showTaskModal && (
        <CreateTaskModal
          onClose={() => setShowTaskModal(false)}
          onSuccess={() => {
            setShowTaskModal(false);
            fetchDashboardData();
          }}
        />
      )}

      {showImportantDatesModal && (
        <ImportantDatesModal
          isOpen={showImportantDatesModal}
          onClose={() => setShowImportantDatesModal(false)}
          onCreateNew={() => {
            setShowImportantDatesModal(false);
            setShowCreateDateModal(true);
          }}
          onDateUpdated={fetchUpcomingDates}
        />
      )}

      {showCreateDateModal && (
        <CreateImportantDateModal
          isOpen={showCreateDateModal}
          onClose={() => setShowCreateDateModal(false)}
          onSuccess={handleDateSaved}
        />
      )}
    </div>
  );
};

export default Dashboard;