import React, { useState, useEffect } from 'react';
import { 
  PencilIcon, 
  TrashIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  PlusIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconFilled } from '@heroicons/react/24/solid';
import api from '../../services/api';
import NoteForm from './NoteForm';
import { useSettings } from '../../contexts/SettingsContext';

const NoteList = () => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    priority: 'all',
    is_pinned: 'all'
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [editNote, setEditNote] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const { t } = useSettings();

  useEffect(() => {
    fetchNotes();
  }, [filters]);

  const fetchNotes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.priority !== 'all') params.append('priority', filters.priority);
      if (filters.is_pinned !== 'all') params.append('is_pinned', filters.is_pinned === 'pinned');
      
      const response = await api.get(`/notes?${params.toString()}`);
      setNotes(response.data.data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta nota?')) return;
    
    try {
      await api.delete(`/notes/${id}`);
      setNotes(notes.filter(note => note.id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handlePinToggle = async (note) => {
    try {
      const updatedNote = await api.put(`/notes/${note.id}`, {
        is_pinned: !note.is_pinned
      });
      
      setNotes(notes.map(n => 
        n.id === note.id ? updatedNote.data.note : n
      ));
    } catch (error) {
      console.error('Error updating note:', error);
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

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'alta': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-300 dark:border-red-800';
      case 'media': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-800';
      case 'baja': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-800';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: 'short'
    });
  };

  const clearFilters = () => {
    setFilters({
      search: '',
      priority: 'all',
      is_pinned: 'all'
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">Mis Notas</h2>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">Organiza tus ideas</p>
          </div>
          
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
          >
            <PlusIcon className="h-4 w-4 mr-1" />
            <span className="hidden md:inline">Nueva</span>
            <span className="md:hidden">+</span>
          </button>
        </div>

        {/* Filtros - Desktop */}
        <div className="hidden md:grid grid-cols-3 gap-3">
          <div className="relative">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar notas..."
              className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
          </div>

          <select
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.priority}
            onChange={(e) => setFilters({...filters, priority: e.target.value})}
          >
            <option value="all">Todas prioridades</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>

          <select
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={filters.is_pinned}
            onChange={(e) => setFilters({...filters, is_pinned: e.target.value})}
          >
            <option value="all">Todas notas</option>
            <option value="pinned">Fijadas</option>
            <option value="not_pinned">No fijadas</option>
          </select>
        </div>

        {/* Filtros - Mobile Header */}
        <div className="md:hidden flex items-center justify-between">
          <div className="relative flex-1 mr-2">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
          </div>
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          </button>
        </div>

        {/* Filtros - Mobile Dropdown */}
        {showMobileFilters && (
          <div className="md:hidden mt-3 grid grid-cols-2 gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Prioridad</label>
              <select
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.priority}
                onChange={(e) => setFilters({...filters, priority: e.target.value})}
              >
                <option value="all">Todas</option>
                <option value="alta">Alta</option>
                <option value="media">Media</option>
                <option value="baja">Baja</option>
              </select>
            </div>
            
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Fijadas</label>
              <select
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.is_pinned}
                onChange={(e) => setFilters({...filters, is_pinned: e.target.value})}
              >
                <option value="all">Todas</option>
                <option value="pinned">Fijadas</option>
                <option value="not_pinned">No fijadas</option>
              </select>
            </div>

            <div className="col-span-2 flex gap-2 pt-2">
              <button
                onClick={clearFilters}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition duration-200"
              >
                Limpiar
              </button>
              <button
                onClick={() => setShowMobileFilters(false)}
                className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600 transition duration-200"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Lista de notas */}
      <div className="max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Cargando...</p>
          </div>
        ) : notes.length === 0 ? (
          <div className="p-6 text-center">
            <div className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-3">
              <PencilIcon className="h-12 w-12" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">No hay notas</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {notes.map((note) => (
              <div 
                key={note.id} 
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200"
              >
                <div className="flex items-start gap-3">
                  {/* Prioridad y Pin */}
                  <div className="flex-shrink-0 flex flex-col items-center gap-2">
                    <div className={`px-2 py-1 rounded-full text-xs font-semibold border ${getPriorityColor(note.priority)}`}>
                      <span className="mr-1">{getPriorityIcon(note.priority)}</span>
                    </div>
                    <button
                      onClick={() => handlePinToggle(note)}
                      className="p-1 text-gray-400 hover:text-yellow-500 transition duration-200"
                      title={note.is_pinned ? "Desfijar" : "Fijar"}
                    >
                      {note.is_pinned ? (
                        <StarIconFilled className="h-4 w-4 text-yellow-500" />
                      ) : (
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                        </svg>
                      )}
                    </button>
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                          {note.title}
                        </h3>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                          {note.content}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={() => {
                            setEditNote(note);
                            setShowForm(true);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition duration-200"
                          title="Editar"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(note.id)}
                          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition duration-200"
                          title="Eliminar"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-2">
                        <span>{formatDate(note.created_at)}</span>
                        {note.updated_at !== note.created_at && (
                          <span className="text-gray-400">•</span>
                        )}
                        {note.updated_at !== note.created_at && (
                          <span>Editada</span>
                        )}
                      </div>
                      {note.category && (
                        <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-300 text-xs rounded-full">
                          {note.category}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de formulario RESPONSIVE */}
      {showForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => {
              setShowForm(false);
              setEditNote(null);
            }}
          />
          
          {/* Modal Container */}
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="relative w-full max-w-lg">
              {/* Modal Content */}
              <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header */}
                <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3 md:px-6 md:py-4 flex items-center justify-between z-10">
                  <div>
                    <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">
                      {editNote ? 'Editar Nota' : 'Nueva Nota'}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {editNote ? 'Modifica los detalles de tu nota' : 'Crea una nueva nota para tus ideas'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditNote(null);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition duration-200"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Form Content */}
                <div className="p-4 md:p-6">
                  <NoteForm
                    note={editNote}
                    onClose={() => {
                      setShowForm(false);
                      setEditNote(null);
                    }}
                    onSuccess={() => {
                      setShowForm(false);
                      setEditNote(null);
                      fetchNotes();
                    }}
                  />
                </div>

                {/* Mobile Bottom Actions (solo en móvil) */}
                <div className="md:hidden bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 p-3 flex gap-2">
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditNote(null);
                    }}
                    className="flex-1 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    form="note-form"
                    className="flex-1 px-4 py-2 text-sm bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition duration-200"
                  >
                    {editNote ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NoteList;