import React, { useState, useEffect } from 'react';
import { 
  CheckCircleIcon,
  ClockIcon,
  TrashIcon,
  PencilIcon,
  MagnifyingGlassIcon,
  XMarkIcon,
  PlusIcon,
  ExclamationCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleIconSolid } from '@heroicons/react/24/solid';
import api from '../../services/api';
import TaskForm from './TaskForm';
import { useSettings } from '../../contexts/SettingsContext';

const TaskList = ({ onTaskUpdate }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '',
    priority: 'all',
    status: 'all'
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const { t } = useSettings();

  useEffect(() => {
    fetchTasks();
  }, [filters]);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.priority !== 'all') params.append('priority', filters.priority);
      if (filters.status !== 'all') params.append('status', filters.status);
      
      const response = await api.get(`/tasks?${params.toString()}`);
      setTasks(response.data.data || []);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta tarea?')) return;
    
    try {
      await api.delete(`/tasks/${id}`);
      setTasks(tasks.filter(task => task.id !== id));
      if (onTaskUpdate) onTaskUpdate();
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleComplete = async (task) => {
    try {
      const newStatus = task.status === 'completada' ? 'pendiente' : 'completada';
      const updatedTask = await api.patch(`/tasks/${task.id}/complete`, {
        status: newStatus
      });
      
      setTasks(tasks.map(t => 
        t.id === task.id ? updatedTask.data.task : t
      ));
      
      if (onTaskUpdate) onTaskUpdate();
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completada': return 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-300 dark:border-green-800';
      case 'en_progreso': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-300 dark:border-blue-800';
      case 'pendiente': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900 dark:text-yellow-300 dark:border-yellow-800';
      default: return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-800';
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

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    const today = new Date().toISOString().split('T')[0];
    return dueDate < today;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Sin fecha';
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
      status: 'all'
    });
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
      {/* Header */}
      <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">Mis Tareas</h2>
            <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">Gestiona tus tareas</p>
          </div>
          
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition duration-200"
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
              placeholder="Buscar tareas..."
              className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
              value={filters.search}
              onChange={(e) => setFilters({...filters, search: e.target.value})}
            />
          </div>

          <select
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            value={filters.priority}
            onChange={(e) => setFilters({...filters, priority: e.target.value})}
          >
            <option value="all">Todas prioridades</option>
            <option value="alta">Alta</option>
            <option value="media">Media</option>
            <option value="baja">Baja</option>
          </select>

          <select
            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            value={filters.status}
            onChange={(e) => setFilters({...filters, status: e.target.value})}
          >
            <option value="all">Todos estados</option>
            <option value="pendiente">Pendiente</option>
            <option value="en_progreso">En progreso</option>
            <option value="completada">Completada</option>
          </select>
        </div>

        {/* Filtros - Mobile Header */}
        <div className="md:hidden flex items-center justify-between">
          <div className="relative flex-1 mr-2">
            <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Buscar..."
              className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
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
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
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
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
              <select
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
              >
                <option value="all">Todos</option>
                <option value="pendiente">Pendiente</option>
                <option value="en_progreso">En progreso</option>
                <option value="completada">Completada</option>
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

      {/* Lista de tareas */}
      <div className="max-h-[400px] overflow-y-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-green-600"></div>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Cargando...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="p-6 text-center">
            <div className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500 mb-3">
              <CheckCircleIcon className="h-12 w-12" />
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400">No hay tareas</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {tasks.map((task) => (
              <div 
                key={task.id} 
                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition duration-200 ${
                  isOverdue(task.due_date) && task.status !== 'completada' ? 'bg-red-50 dark:bg-red-900/20' : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <button
                    onClick={() => handleComplete(task)}
                    className="flex-shrink-0 mt-1"
                    title={task.status === 'completada' ? "Marcar como pendiente" : "Completar"}
                  >
                    {task.status === 'completada' ? (
                      <CheckCircleIconSolid className="h-5 w-5 text-green-500" />
                    ) : (
                      <div className="h-5 w-5 border-2 border-gray-300 dark:border-gray-600 rounded-full hover:border-green-500 transition duration-200"></div>
                    )}
                  </button>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm">{getPriorityIcon(task.priority)}</span>
                          <h3 className={`text-sm font-semibold truncate ${
                            task.status === 'completada' 
                              ? 'line-through text-gray-500 dark:text-gray-400' 
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {task.title}
                          </h3>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                          {task.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 ml-2">
                        <button
                          onClick={() => {
                            setEditTask(task);
                            setShowForm(true);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition duration-200"
                          title="Editar"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition duration-200"
                          title="Eliminar"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <div className="flex items-center gap-3">
                        {/* Estado */}
                        <span className={`px-2 py-1 rounded-full border ${getStatusColor(task.status)}`}>
                          {task.status === 'en_progreso' ? 'En Progreso' : task.status}
                        </span>
                        
                        {/* Fecha y vencimiento */}
                        {task.due_date && (
                          <div className="flex items-center gap-1">
                            <ClockIcon className="h-3 w-3" />
                            <span className={isOverdue(task.due_date) && task.status !== 'completada' ? 'text-red-600 dark:text-red-400 font-medium' : 'text-gray-500 dark:text-gray-400'}>
                              {formatDate(task.due_date)}
                            </span>
                            {isOverdue(task.due_date) && task.status !== 'completada' && (
                              <ExclamationCircleIcon className="h-3 w-3 text-red-500" />
                            )}
                          </div>
                        )}
                      </div>
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
              setEditTask(null);
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
                      {editTask ? 'Editar Tarea' : 'Nueva Tarea'}
                    </h3>
                    <p className="text-xs md:text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {editTask ? 'Modifica los detalles de tu tarea' : 'Crea una nueva tarea para organizarte'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditTask(null);
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition duration-200"
                  >
                    <XCircleIcon className="h-6 w-6" />
                  </button>
                </div>

                {/* Form Content */}
                <div className="p-4 md:p-6">
                  <TaskForm
                    task={editTask}
                    onClose={() => {
                      setShowForm(false);
                      setEditTask(null);
                    }}
                    onSuccess={() => {
                      setShowForm(false);
                      setEditTask(null);
                      fetchTasks();
                      if (onTaskUpdate) onTaskUpdate();
                    }}
                  />
                </div>

                {/* Mobile Bottom Actions (solo en móvil) */}
                <div className="md:hidden bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600 p-3 flex gap-2">
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditTask(null);
                    }}
                    className="flex-1 px-4 py-2 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    form="task-form"
                    className="flex-1 px-4 py-2 text-sm bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition duration-200"
                  >
                    {editTask ? 'Actualizar' : 'Crear'}
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

export default TaskList;