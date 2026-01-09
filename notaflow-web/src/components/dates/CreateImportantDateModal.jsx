import React, { useState, useEffect } from 'react';
import { XMarkIcon, BellIcon, CalendarIcon } from '@heroicons/react/24/outline';
import { importantDatesApi } from '../../services/api';
import { useSettings } from '../../contexts/SettingsContext';

const CreateImportantDateModal = ({ isOpen, onClose, onSuccess, editingDate = null }) => {
  const { t } = useSettings();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    importance: 'media',
    has_alarm: false,
    alarm_time: '09:00',
    alarm_days_before: [0, 1, 3],
    color: '#3B82F6',
    is_recurring: false,
    recurring_type: 'yearly'
  });

  const importanceColors = {
    baja: '#10B981',
    media: '#F59E0B',
    alta: '#EF4444',
    muy_alta: '#DC2626'
  };

  const dayOptions = [
    { value: 0, label: t('today') },
    { value: 1, label: t('tomorrow') },
    { value: 3, label: '3 días antes' },
    { value: 7, label: t('inAWeek') },
    { value: 30, label: t('inAMonth') }
  ];

  useEffect(() => {
    if (editingDate) {
      setFormData({
        title: editingDate.title || '',
        description: editingDate.description || '',
        date: editingDate.date.split('T')[0] || new Date().toISOString().split('T')[0],
        importance: editingDate.importance || 'media',
        has_alarm: editingDate.has_alarm || false,
        alarm_time: editingDate.alarm_time || '09:00',
        alarm_days_before: editingDate.alarm_days_before || [0, 1, 3],
        color: editingDate.color || importanceColors[editingDate.importance] || '#3B82F6',
        is_recurring: editingDate.is_recurring || false,
        recurring_type: editingDate.recurring_type || 'yearly'
      });
    }
  }, [editingDate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const dataToSend = {
        ...formData,
        color: importanceColors[formData.importance] || formData.color
      };

      if (editingDate) {
        await importantDatesApi.update(editingDate.id, dataToSend);
      } else {
        await importantDatesApi.create(dataToSend);
      }

      onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving important date:', error);
      alert(error.response?.data?.message || 'Error al guardar la fecha');
    } finally {
      setLoading(false);
    }
  };

  const handleDayToggle = (day) => {
    const currentDays = [...formData.alarm_days_before];
    if (currentDays.includes(day)) {
      setFormData({
        ...formData,
        alarm_days_before: currentDays.filter(d => d !== day)
      });
    } else {
      setFormData({
        ...formData,
        alarm_days_before: [...currentDays, day]
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />
        
        <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white dark:bg-gray-800 rounded-lg shadow-xl sm:my-8 sm:align-middle">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">
              {editingDate ? t('editImportantDate') : t('createImportantDate')}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Título */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('dateTitle')} *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Ej: Cumpleaños, Aniversario, Reunión importante..."
              />
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('dateDescription')}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Descripción detallada del evento..."
              />
            </div>

            {/* Fecha */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                {t('selectDate')} *
              </label>
              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 text-gray-400 mr-2" />
                <input
                  type="date"
                  required
                  value={formData.date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Importancia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('importanceLevel')}
              </label>
              <div className="grid grid-cols-4 gap-2">
                {['baja', 'media', 'alta', 'muy_alta'].map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setFormData({...formData, importance: level, color: importanceColors[level]})}
                    className={`py-2 px-1 rounded-lg text-sm font-medium transition-all ${
                      formData.importance === level
                        ? 'ring-2 ring-offset-1'
                        : 'opacity-80 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor: importanceColors[level] + '20',
                      color: importanceColors[level],
                      borderColor: importanceColors[level],
                      ringColor: importanceColors[level]
                    }}
                  >
                    {t(level === 'muy_alta' ? 'veryHigh' : level)}
                  </button>
                ))}
              </div>
            </div>

            {/* Alarma */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center">
                  <BellIcon className="h-5 w-5 text-gray-400 mr-2" />
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {t('setAlarm')}
                  </label>
                </div>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, has_alarm: !formData.has_alarm})}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.has_alarm ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.has_alarm ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {formData.has_alarm && (
                <div className="space-y-3 pl-7">
                  {/* Hora de la alarma */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      {t('alarmTime')}
                    </label>
                    <input
                      type="time"
                      value={formData.alarm_time}
                      onChange={(e) => setFormData({...formData, alarm_time: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  {/* Días antes para notificar */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      {t('alarmDaysBefore')}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {dayOptions.map((day) => (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => handleDayToggle(day.value)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                            formData.alarm_days_before.includes(day.value)
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
                          }`}
                        >
                          {day.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Evento recurrente */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {t('recurringEvent')}
                </label>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, is_recurring: !formData.is_recurring})}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    formData.is_recurring ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.is_recurring ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {formData.is_recurring && (
                <div className="pl-7">
                  <select
                    value={formData.recurring_type}
                    onChange={(e) => setFormData({...formData, recurring_type: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="yearly">{t('yearly')}</option>
                    <option value="monthly">{t('monthly')}</option>
                    <option value="weekly">{t('weekly')}</option>
                  </select>
                </div>
              )}
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Guardando...' : t('saveDate')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateImportantDateModal;