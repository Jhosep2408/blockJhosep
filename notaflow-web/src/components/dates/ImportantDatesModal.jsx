import React, { useState, useEffect } from 'react';
import { XMarkIcon, CalendarIcon, BellIcon, PencilIcon, TrashIcon, PlusIcon } from '@heroicons/react/24/outline';
import { importantDatesApi } from '../../services/api';
import { useSettings } from '../../contexts/SettingsContext';
import CreateImportantDateModal from './CreateImportantDateModal';

const ImportantDatesModal = ({ isOpen, onClose, onCreateNew }) => {
  const { t } = useSettings();
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingDate, setEditingDate] = useState(null);
  const [filter, setFilter] = useState('all'); // all, upcoming, with_alarm

  useEffect(() => {
    if (isOpen) {
      fetchDates();
    }
  }, [isOpen, filter]);

  const fetchDates = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter === 'upcoming') {
        params.upcoming = 30;
      } else if (filter === 'with_alarm') {
        params.has_alarm = 'true';
      }
      
      const response = await importantDatesApi.getAll(params);
      setDates(response.data.data || []);
    } catch (error) {
      console.error('Error fetching dates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('confirmDeleteDate'))) return;
    
    try {
      await importantDatesApi.delete(id);
      setDates(dates.filter(date => date.id !== id));
    } catch (error) {
      console.error('Error deleting date:', error);
      alert('Error al eliminar la fecha');
    }
  };

  const handleEdit = (date) => {
    setEditingDate(date);
    setShowCreateModal(true);
  };

  const handleDateSaved = () => {
    fetchDates();
    setShowCreateModal(false);
    setEditingDate(null);
  };

  if (!isOpen) return null;

  const importanceColors = {
    baja: '#10B981',
    media: '#F59E0B',
    alta: '#EF4444',
    muy_alta: '#DC2626'
  };

  return (
    <>
      <div className="fixed inset-0 z-50 overflow-y-auto">
        <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />
          
          <div className="inline-block w-full max-w-4xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 rounded-lg shadow-xl sm:my-8 sm:align-middle">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {t('importantDates')}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                  Gestiona todas tus fechas importantes en un solo lugar
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  {t('addNewDate')}
                </button>
                <button
                  onClick={onClose}
                  className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                >
                  <XMarkIcon className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Filtros */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFilter('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {t('allDates')}
                </button>
                <button
                  onClick={() => setFilter('upcoming')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'upcoming'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  {t('upcomingDates')}
                </button>
                <button
                  onClick={() => setFilter('with_alarm')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === 'with_alarm'
                      ? 'bg-yellow-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Con Alarma
                </button>
              </div>
            </div>

            {/* Lista de fechas */}
            <div className="max-h-[500px] overflow-y-auto">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 dark:text-gray-400 mt-4">Cargando fechas...</p>
                </div>
              ) : dates.length === 0 ? (
                <div className="text-center py-12">
                  <CalendarIcon className="h-16 w-16 text-gray-300 dark:text-gray-600 mx-auto" />
                  <h4 className="text-gray-700 dark:text-gray-300 mt-4 text-lg font-medium">
                    {t('noImportantDates')}
                  </h4>
                  <p className="text-gray-500 dark:text-gray-400 mt-2">
                    Añade tu primera fecha importante haciendo clic en "Añadir Nueva Fecha"
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dates.map((date) => {
                    const dateObj = new Date(date.date);
                    const formattedDate = dateObj.toLocaleDateString(
                      'es-ES',
                      { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
                    );
                    const daysUntil = Math.ceil((dateObj - new Date()) / (1000 * 60 * 60 * 24));
                    
                    return (
                      <div
                        key={date.id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                      >
                        <div className="flex items-start flex-1">
                          <div
                            className="h-10 w-2 rounded-full mr-4"
                            style={{ backgroundColor: importanceColors[date.importance] || '#3B82F6' }}
                          />
                          
                          <div className="flex-1">
                            <div className="flex items-center">
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {date.title}
                              </h4>
                              <span className="ml-2 px-2 py-1 text-xs font-medium rounded-full"
                                style={{
                                  backgroundColor: importanceColors[date.importance] + '20',
                                  color: importanceColors[date.importance]
                                }}
                              >
                                {t(date.importance === 'muy_alta' ? 'veryHigh' : date.importance)}
                              </span>
                            </div>
                            
                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                              {date.description}
                            </p>
                            
                            <div className="flex items-center mt-2 space-x-4">
                              <div className="flex items-center text-gray-500 dark:text-gray-400 text-sm">
                                <CalendarIcon className="h-4 w-4 mr-1" />
                                {formattedDate}
                              </div>
                              
                              {daysUntil > 0 && (
                                <div className="text-sm">
                                  <span className="text-gray-500 dark:text-gray-400">
                                    {daysUntil === 1 ? 'Mañana' : `En ${daysUntil} días`}
                                  </span>
                                </div>
                              )}
                              
                              {date.has_alarm && (
                                <div className="flex items-center text-yellow-600 dark:text-yellow-400 text-sm">
                                  <BellIcon className="h-4 w-4 mr-1" />
                                  Alarma {date.alarm_time}
                                </div>
                              )}
                              
                              {date.is_recurring && (
                                <div className="text-sm text-purple-600 dark:text-purple-400">
                                  {t(date.recurring_type)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2 ml-4">
                          <button
                            onClick={() => handleEdit(date)}
                            className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500"
                            title="Editar"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(date.id)}
                            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500"
                            title="Eliminar"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {showCreateModal && (
        <CreateImportantDateModal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false);
            setEditingDate(null);
          }}
          onSuccess={handleDateSaved}
          editingDate={editingDate}
        />
      )}
    </>
  );
};

export default ImportantDatesModal;