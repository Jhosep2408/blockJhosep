import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';

const TaskForm = ({ task, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'media',
    status: 'pendiente'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        due_date: task.due_date ? task.due_date.split('T')[0] : '',
        priority: task.priority || 'media',
        status: task.status || 'pendiente'
      });
    } else {
      // Establecer fecha mínima (hoy)
      const today = new Date().toISOString().split('T')[0];
      setFormData(prev => ({ ...prev, due_date: today }));
    }
  }, [task]);

  const validateForm = () => {
    const newErrors = {};
    const today = new Date().toISOString().split('T')[0];
    
    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    } else if (formData.title.length > 255) {
      newErrors.title = 'El título no puede exceder 255 caracteres';
    }
    
    if (!formData.due_date) {
      newErrors.due_date = 'La fecha límite es requerida';
    } else if (formData.due_date < today && !task) {
      newErrors.due_date = 'La fecha límite no puede ser en el pasado';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      setLoading(false);
      return;
    }

    try {
      if (task) {
        // Actualizar tarea existente
        await api.put(`/tasks/${task.id}`, formData);
      } else {
        // Crear nueva tarea
        await api.post('/tasks', formData);
      }
      
      onSuccess();
    } catch (error) {
      if (error.response?.status === 422) {
        const serverErrors = error.response.data.errors;
        const formattedErrors = {};
        Object.keys(serverErrors).forEach(key => {
          formattedErrors[key] = serverErrors[key][0];
        });
        setErrors(formattedErrors);
      } else {
        setErrors({ general: 'Error del servidor. Por favor, intenta de nuevo.' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleDescriptionChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, description: value }));
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {task ? 'Editar Tarea' : 'Nueva Tarea'}
          </h2>
          <p className="text-gray-600 mt-1">
            {task ? 'Actualiza los detalles de tu tarea' : 'Define una nueva tarea para realizar'}
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition duration-200"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>
      </div>

      {errors.general && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center">
            <svg className="h-5 w-5 text-red-400 mr-2" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <p className="text-sm text-red-700">{errors.general}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
            Título *
          </label>
          <input
            id="title"
            name="title"
            type="text"
            className={`w-full px-4 py-3 border ${errors.title ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-green-500 focus:border-green-500'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50`}
            placeholder="Título de la tarea"
            value={formData.title}
            onChange={handleChange}
            maxLength={255}
          />
          {errors.title && (
            <p className="mt-1 text-sm text-red-600">{errors.title}</p>
          )}
          <div className="mt-1 text-xs text-gray-500 text-right">
            {formData.title.length}/255 caracteres
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Descripción
            </label>
            <span className="text-xs text-gray-500">
              {formData.description.length} caracteres
            </span>
          </div>
          <textarea
            id="description"
            name="description"
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:ring-opacity-50 resize-none"
            placeholder="Describe la tarea en detalle..."
            value={formData.description}
            onChange={handleDescriptionChange}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 mb-2">
              Fecha límite *
            </label>
            <input
              id="due_date"
              name="due_date"
              type="date"
              className={`w-full px-4 py-3 border ${errors.due_date ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-green-500 focus:border-green-500'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50`}
              value={formData.due_date}
              onChange={handleChange}
              min={!task ? new Date().toISOString().split('T')[0] : undefined}
            />
            {errors.due_date && (
              <p className="mt-1 text-sm text-red-600">{errors.due_date}</p>
            )}
          </div>

          <div>
            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
              Prioridad
            </label>
            <div className="flex gap-2">
              {[
                { value: 'alta', label: 'Alta', color: 'bg-red-100 text-red-700 border-red-300' },
                { value: 'media', label: 'Media', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
                { value: 'baja', label: 'Baja', color: 'bg-green-100 text-green-700 border-green-300' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, priority: option.value }));
                    if (errors.priority) setErrors(prev => ({ ...prev, priority: null }));
                  }}
                  className={`flex-1 px-4 py-2 border rounded-lg transition duration-200 ${formData.priority === option.value ? option.color + ' ring-2 ring-offset-1' : 'bg-white border-gray-300 hover:bg-gray-50'}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
              Estado
            </label>
            <div className="flex gap-2">
              {[
                { value: 'pendiente', label: 'Pendiente', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
                { value: 'en_progreso', label: 'En Progreso', color: 'bg-blue-100 text-blue-700 border-blue-300' },
                { value: 'completada', label: 'Completada', color: 'bg-green-100 text-green-700 border-green-300' }
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, status: option.value }));
                    if (errors.status) setErrors(prev => ({ ...prev, status: null }));
                  }}
                  className={`flex-1 px-4 py-2 border rounded-lg transition duration-200 ${formData.status === option.value ? option.color + ' ring-2 ring-offset-1' : 'bg-white border-gray-300 hover:bg-gray-50'}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-sm text-gray-600">Días restantes</div>
              <div className="text-2xl font-bold text-gray-800 mt-1">
                {(() => {
                  if (!formData.due_date) return '-';
                  const dueDate = new Date(formData.due_date);
                  const today = new Date();
                  const diffTime = dueDate - today;
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  return diffDays;
                })()}
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition duration-200"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {task ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                task ? 'Actualizar Tarea' : 'Crear Tarea'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default TaskForm;