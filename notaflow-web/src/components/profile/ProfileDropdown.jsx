// components/profile/ProfileDropdown.jsx
import React, { useState, useRef, useEffect } from 'react';
import { 
  UserCircleIcon, 
  Cog6ToothIcon, 
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  UserIcon,
  ShieldCheckIcon,
  QuestionMarkCircleIcon,
  EnvelopeIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';

const ProfileDropdown = ({ user, onLogout, onProfileClick, onSettingsClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleProfileClick = () => {
    setIsOpen(false);
    if (onProfileClick) {
      onProfileClick();
    }
  };

  const handleSettingsClick = () => {
    setIsOpen(false);
    // Aquí puedes manejar la configuración
    console.log('Abrir configuración');
  };

  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogoutClick = () => {
    setIsOpen(false);
    setShowConfirm(true);
  };

  const confirmLogout = async () => {
    setShowConfirm(false);
    setIsLoggingOut(true);
    try {
      if (onLogout) {
        await onLogout();
      }
    } catch (e) {
      console.error('Error during logout:', e);
    } finally {
      // small delay so user sees the animation
      setTimeout(() => setIsLoggingOut(false), 800);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
      >
        <div className="flex-shrink-0">
          <div className="h-10 w-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-sm">
            <span className="text-white font-medium text-sm">
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
        </div>
        <div className="hidden lg:block text-left">
          <p className="text-sm font-medium text-gray-900">{user?.name || 'Usuario'}</p>
          <p className="text-xs text-gray-500 truncate max-w-[180px]">
            {user?.email || 'correo@ejemplo.com'}
          </p>
        </div>
        <ChevronDownIcon className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2">
          {/* Header del dropdown */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center">
              <div className="h-12 w-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                <span className="text-white font-medium">
                  {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="ml-3">
                <p className="text-sm font-semibold text-gray-900">{user?.name || 'Usuario'}</p>
                <p className="text-xs text-gray-500 truncate max-w-[180px]">
                  {user?.email || 'correo@ejemplo.com'}
                </p>
              </div>
            </div>
          </div>

          {/* Opciones principales */}
          <div className="py-2">
            <button
              onClick={handleProfileClick}
              className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-150 group"
            >
              <UserIcon className="h-5 w-5 mr-3 text-gray-400 group-hover:text-blue-500" />
              <div className="text-left">
                <p className="font-medium">Mi Perfil</p>
                <p className="text-xs text-gray-500">Ver y editar tu información</p>
              </div>
            </button>

        <button
            onClick={onSettingsClick}
            className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-150 group"
          >
            <Cog6ToothIcon className="h-5 w-5 mr-3 text-gray-400 group-hover:text-gray-500" />
            <div className="text-left">
              <p className="font-medium">Configuración</p>
              <p className="text-xs text-gray-500">Ajustes de la aplicación</p>
            </div>
          </button>
          </div>

          {/* Opciones adicionales */}
          <div className="py-2 border-t border-gray-100">
            <button
              onClick={() => {
                setIsOpen(false);
                console.log('Privacidad y seguridad');
              }}
              className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-150"
            >
              <ShieldCheckIcon className="h-5 w-5 mr-3 text-gray-400" />
              Privacidad y Seguridad
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                console.log('Ayuda y soporte');
              }}
              className="w-full flex items-center px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors duration-150"
            >
              <QuestionMarkCircleIcon className="h-5 w-5 mr-3 text-gray-400" />
              Ayuda y Soporte
            </button>
          </div>

          {/* Cerrar sesión */}
          <div className="py-2 border-t border-gray-100">
            <button
              onClick={handleLogoutClick}
              className="w-full flex items-center px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors duration-150 group"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
              <span className="font-medium">Cerrar sesión</span>
            </button>
          </div>

          {/* Versión de la app */}
          <div className="px-4 py-2 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center">v1.0.0 • NotaFlow</p>
          </div>
        </div>
      )}

      {/* Confirmación modal (simple, sin dependencias) */}
      {showConfirm && (
        <div className="fixed inset-0 z-60 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg p-6 w-80 shadow-lg">
            <h3 className="text-lg font-semibold mb-2">¿Estás seguro?</h3>
            <p className="text-sm text-gray-600 mb-4">¿Deseas cerrar sesión?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="px-3 py-2 rounded-md border border-gray-200 text-sm text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={confirmLogout}
                className="px-3 py-2 rounded-md bg-red-600 text-white text-sm hover:bg-red-700"
              >
                Cerrar sesión
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Animación de cerrando sesión */}
      {isLoggingOut && (
        <div className="fixed inset-0 z-70 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg p-6 w-72 shadow-lg flex flex-col items-center">
            <div className="h-12 w-12 mb-4 flex items-center justify-center">
              <div className="h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="font-medium mb-1">Cerrando sesión</p>
            <p className="text-sm text-gray-500">Espere un momento...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;