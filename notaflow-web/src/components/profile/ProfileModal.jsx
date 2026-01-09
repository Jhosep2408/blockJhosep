// components/ProfileModal.jsx
import React, { useState, useEffect } from 'react';
import { 
  XMarkIcon,
  UserCircleIcon,
  EnvelopeIcon,
  LockClosedIcon,
  DevicePhoneMobileIcon,
  MapPinIcon,
  PhotoIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import api from '../../services/api'; // Ruta corregida

const ProfileModal = ({ isOpen, onClose, user: initialUser, onProfileUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [user, setUser] = useState(initialUser || {});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Cargar datos del perfil al abrir el modal
  useEffect(() => {
    const fetchProfileData = async () => {
      if (isOpen) {
        setLoading(true);
        try {
          const response = await api.get('/profile');
          if (response.data.status === 'success') {
            const userData = response.data.data;
            setUser(userData);
            setFormData({
              name: userData.name || '',
              email: userData.email || '',
              phone: userData.phone || '',
              location: userData.location || '',
              currentPassword: '',
              newPassword: '',
              confirmPassword: '',
            });
          }
        } catch (error) {
          console.error('Error fetching profile:', error);
          // Si falla, usar datos iniciales
          if (initialUser) {
            setUser(initialUser);
            setFormData({
              name: initialUser.name || '',
              email: initialUser.email || '',
              phone: initialUser.phone || '',
              location: initialUser.location || '',
              currentPassword: '',
              newPassword: '',
              confirmPassword: '',
            });
          }
        } finally {
          setLoading(false);
        }
      }
    };

    fetchProfileData();
  }, [isOpen, initialUser]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      // Validar contraseñas si se están cambiando
      if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
        setErrorMessage('Las nuevas contraseñas no coinciden');
        setSaving(false);
        return;
      }

      // Actualizar información del perfil
      const updateData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone || '',
        location: formData.location || '',
      };

      // Si hay contraseña actual, actualizar contraseña primero
      if (formData.currentPassword) {
        try {
          const passwordResponse = await api.put('/profile/password', {
            current_password: formData.currentPassword,
            new_password: formData.newPassword,
            new_password_confirmation: formData.confirmPassword,
          });
          
          if (passwordResponse.data.status !== 'success') {
            setErrorMessage(passwordResponse.data.message || 'Error al actualizar contraseña');
            setSaving(false);
            return;
          }
        } catch (error) {
          setErrorMessage(error.response?.data?.message || 'Error al actualizar contraseña');
          setSaving(false);
          return;
        }
      }

      // Actualizar información del perfil
      const response = await api.put('/profile', updateData);
      
      if (response.data.status === 'success') {
        setSuccessMessage('Perfil actualizado correctamente');
        
        // Actualizar usuario en localStorage
        const updatedUser = { ...user, ...updateData };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        // Notificar al componente padre
        if (onProfileUpdate) {
          onProfileUpdate(updatedUser);
        }
        
        // Limpiar campos de contraseña
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        }));
        
        // Cerrar automáticamente después de 2 segundos
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setErrorMessage(response.data.message || 'Error al actualizar perfil');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setErrorMessage(
        error.response?.data?.message || 
        error.response?.data?.errors?.email?.[0] || 
        'Error al actualizar perfil. Verifica los datos.'
      );
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('avatar', file);

    try {
      setLoading(true);
      const response = await api.post('/profile/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.status === 'success') {
        setSuccessMessage('Foto de perfil actualizada');
        
        // Actualizar usuario localmente
        const updatedUser = { ...user, avatar: response.data.data.avatar_url };
        setUser(updatedUser);
        localStorage.setItem('user', JSON.stringify(updatedUser));
        
        if (onProfileUpdate) {
          onProfileUpdate(updatedUser);
        }
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Error al subir imagen');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" 
          onClick={onClose}
        />
        
        {/* Modal panel */}
        <div className="inline-block transform overflow-hidden rounded-lg bg-white text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:align-middle">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                  <UserCircleIcon className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Mi Perfil</h3>
                  <p className="text-sm text-blue-100">Administra tu información personal</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-md text-white/80 hover:text-white focus:outline-none"
              >
                <span className="sr-only">Cerrar</span>
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Contenido */}
          <div className="bg-white px-6 py-6">
            {loading && !saving && (
              <div className="flex justify-center items-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            )}

            {successMessage && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3" />
                <p className="text-green-700 text-sm">{successMessage}</p>
              </div>
            )}

            {errorMessage && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm">{errorMessage}</p>
              </div>
            )}

            <form onSubmit={handleSaveProfile}>
              {/* Información básica */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <UserCircleIcon className="h-5 w-5 mr-2 text-gray-400" />
                  Información Personal
                </h4>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      required
                      disabled={loading}
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Correo electrónico
                    </label>
                    <div className="relative">
                      <EnvelopeIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <div className="relative">
                      <DevicePhoneMobileIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="+34 123 456 789"
                        disabled={loading}
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Ubicación
                    </label>
                    <div className="relative">
                      <MapPinIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        name="location"
                        value={formData.location}
                        onChange={handleInputChange}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ciudad, País"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Cambio de contraseña */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <LockClosedIcon className="h-5 w-5 mr-2 text-gray-400" />
                  Cambiar Contraseña
                </h4>
                <p className="text-sm text-gray-500 mb-4">
                  Deja estos campos en blanco si no quieres cambiar la contraseña
                </p>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Contraseña actual
                    </label>
                    <input
                      type="password"
                      name="currentPassword"
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="••••••••"
                      disabled={loading}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nueva contraseña
                      </label>
                      <input
                        type="password"
                        name="newPassword"
                        value={formData.newPassword}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="••••••••"
                        disabled={loading}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Confirmar nueva contraseña
                      </label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="••••••••"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Foto de perfil */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <PhotoIcon className="h-5 w-5 mr-2 text-gray-400" />
                  Foto de Perfil
                </h4>
                
                <div className="flex items-center space-x-6">
                  <div className="h-24 w-24 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt="Avatar" 
                        className="h-full w-full rounded-full object-cover"
                      />
                    ) : (
                      <span className="text-white text-2xl font-bold">
                        {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    )}
                  </div>
                  
                  <div>
                    <button
                      type="button"
                      onClick={() => document.getElementById('avatar-upload').click()}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50"
                      disabled={loading}
                    >
                      Cambiar foto
                    </button>
                    <input 
                      type="file" 
                      id="avatar-upload" 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleAvatarUpload}
                      disabled={loading}
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      PNG, JPG o GIF. Máximo 2MB
                    </p>
                  </div>
                </div>
              </div>

              {/* Footer con botones */}
              <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
                  disabled={saving || loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving || loading}
                  className={`px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center ${
                    (saving || loading) ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {saving ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Guardando...
                    </>
                  ) : (
                    'Guardar cambios'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;