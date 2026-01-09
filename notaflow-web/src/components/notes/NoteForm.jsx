import React, { useState, useEffect } from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import api from '../../services/api';

const NoteForm = ({ note, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'media',
    is_pinned: false
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (note) {
      setFormData({
        title: note.title || '',
        content: note.content || '',
        priority: note.priority || 'media',
        is_pinned: note.is_pinned || false
      });
    }
  }, [note]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'El título es requerido';
    } else if (formData.title.length > 255) {
      newErrors.title = 'El título no puede exceder 255 caracteres';
    }
    
    if (!formData.content.trim()) {
      newErrors.content = 'El contenido es requerido';
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
      if (note) {
        // Actualizar nota existente
        await api.put(`/notes/${note.id}`, formData);
      } else {
        // Crear nueva nota
        await api.post('/notes', formData);
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
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
  };

  const handleContentChange = (e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, content: value }));
    
    if (errors.content) {
      setErrors(prev => ({ ...prev, content: null }));
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {note ? 'Editar Nota' : 'Nueva Nota'}
          </h2>
          <p className="text-gray-600 mt-1">
            {note ? 'Actualiza los detalles de tu nota' : 'Comienza a escribir tus ideas'}
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
            className={`w-full px-4 py-3 border ${errors.title ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50`}
            placeholder="Título de la nota"
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
            <label htmlFor="content" className="block text-sm font-medium text-gray-700">
              Contenido *
            </label>
            <span className="text-xs text-gray-500">
              {formData.content.length} caracteres
            </span>
          </div>
          <textarea
            id="content"
            name="content"
            rows={8}
            className={`w-full px-4 py-3 border ${errors.content ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'} rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-opacity-50 resize-none`}
            placeholder="Escribe el contenido de tu nota aquí..."
            value={formData.content}
            onChange={handleContentChange}
          />
          {errors.content && (
            <p className="mt-1 text-sm text-red-600">{errors.content}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Opciones
            </label>
            <div className="flex items-center">
              <input
                id="is_pinned"
                name="is_pinned"
                type="checkbox"
                checked={formData.is_pinned}
                onChange={handleChange}
                className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="is_pinned" className="ml-2 block text-sm text-gray-900">
                Fijar esta nota en la parte superior
              </label>
            </div>
            <p className="mt-1 text-xs text-gray-500">
              Las notas fijadas aparecerán primero en la lista
            </p>
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
              className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition duration-200"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {note ? 'Actualizando...' : 'Creando...'}
                </>
              ) : (
                note ? 'Actualizar Nota' : 'Crear Nota'
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default NoteForm;