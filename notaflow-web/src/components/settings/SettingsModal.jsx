// src/components/settings/SettingsModal.jsx
import React, { useState } from 'react';
import { 
  XMarkIcon,
  SunIcon,
  MoonIcon,
  ComputerDesktopIcon,
  LanguageIcon,
  BellIcon,
  EnvelopeIcon,
  EyeIcon,
  EyeSlashIcon,
  ShieldCheckIcon,
  DocumentArrowDownIcon,
  TrashIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { useSettings } from '../../contexts/SettingsContext';
import api from '../../services/api';

const SettingsModal = ({ isOpen, onClose }) => {
  const { settings, updateSetting, toggleTheme, toggleLanguage, t } = useSettings();
  const [activeTab, setActiveTab] = useState('general');
  const [exporting, setExporting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [exportMessage, setExportMessage] = useState('');
  const [deleteMessage, setDeleteMessage] = useState('');

  const handleExportData = async () => {
    setExporting(true);
    setExportMessage('');
    
    try {
      // Aquí puedes implementar la exportación real
      setTimeout(() => {
        setExportMessage(t('export') + ' ' + t('success'));
        setExporting(false);
        
        // Simular descarga
        const data = {
          notes: [],
          tasks: [],
          profile: {},
          settings: settings
        };
        
        const dataStr = JSON.stringify(data, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `notaflow-backup-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        setTimeout(() => setExportMessage(''), 3000);
      }, 1500);
    } catch (error) {
      setExportMessage(t('error') + ': ' + error.message);
      setExporting(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'ELIMINAR') {
      setDeleteMessage(t('deleteWarning'));
      return;
    }
    
    setDeleting(true);
    setDeleteMessage('');
    
    try {
      const response = await api.delete('/profile', {
        data: { password: 'current_password_here' }
      });
      
      if (response.data.status === 'success') {
        localStorage.clear();
        window.location.href = '/login';
      }
    } catch (error) {
      setDeleteMessage(t('error') + ': ' + (error.response?.data?.message || error.message));
      setDeleting(false);
    }
  };

  if (!isOpen) return null;

  const tabs = [
    { id: 'general', label: t('settings'), icon: BellIcon },
    { id: 'appearance', label: t('appearance'), icon: SunIcon },
    { id: 'language', label: t('language'), icon: LanguageIcon },
    { id: 'privacy', label: t('privacy'), icon: ShieldCheckIcon },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity dark:bg-gray-900 dark:bg-opacity-75" 
          onClick={onClose}
        />
        
        <div className="inline-block transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-4xl sm:align-middle">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="h-12 w-12 bg-white/20 rounded-full flex items-center justify-center mr-4">
                  <BellIcon className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{t('settings')}</h3>
                  <p className="text-sm text-blue-100">{t('appearance')}, {t('language')} & {t('privacy')}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-md text-white/80 hover:text-white focus:outline-none"
              >
                <span className="sr-only">{t('cancel')}</span>
                <XMarkIcon className="h-6 w-6" />
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700">
            <div className="px-6">
              <nav className="flex space-x-8 overflow-x-auto" aria-label="Tabs">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    <tab.icon className="h-5 w-5 mr-2" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="bg-white dark:bg-gray-800 px-6 py-6 max-h-[60vh] overflow-y-auto">
            {/* General Settings */}
            {activeTab === 'general' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <BellIcon className="h-5 w-5 mr-2 text-gray-400" />
                    {t('notifications')}
                  </h4>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{t('notifications')}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {settings.notifications ? t('enable') : t('disable')} {t('notifications').toLowerCase()}
                        </p>
                      </div>
                      <button
                        onClick={() => updateSetting('notifications', !settings.notifications)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          settings.notifications ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            settings.notifications ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{t('emailNotifications')}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Recibir notificaciones por correo
                        </p>
                      </div>
                      <button
                        onClick={() => updateSetting('emailNotifications', !settings.emailNotifications)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          settings.emailNotifications ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            settings.emailNotifications ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{t('compactView')}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Mostrar más contenido en menos espacio
                        </p>
                      </div>
                      <button
                        onClick={() => updateSetting('compactView', !settings.compactView)}
                        className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                          settings.compactView ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                        }`}
                      >
                        <span
                          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                            settings.compactView ? 'translate-x-5' : 'translate-x-0'
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Settings */}
            {activeTab === 'appearance' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <SunIcon className="h-5 w-5 mr-2 text-gray-400" />
                    {t('theme')}
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => updateSetting('theme', 'light')}
                      className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                        settings.theme === 'light'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <SunIcon className={`h-8 w-8 mb-2 ${
                        settings.theme === 'light' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
                      }`} />
                      <span className="font-medium text-gray-900 dark:text-white">{t('light')}</span>
                    </button>

                    <button
                      onClick={() => updateSetting('theme', 'dark')}
                      className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                        settings.theme === 'dark'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <MoonIcon className={`h-8 w-8 mb-2 ${
                        settings.theme === 'dark' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
                      }`} />
                      <span className="font-medium text-gray-900 dark:text-white">{t('dark')}</span>
                    </button>

                    <button
                      onClick={() => updateSetting('theme', 'system')}
                      className={`flex flex-col items-center p-4 rounded-lg border-2 transition-all ${
                        settings.theme === 'system'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <ComputerDesktopIcon className={`h-8 w-8 mb-2 ${
                        settings.theme === 'system' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'
                      }`} />
                      <span className="font-medium text-gray-900 dark:text-white">{t('system')}</span>
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {settings.theme === 'system' 
                        ? 'El tema seguirá la configuración de tu sistema'
                        : `Tema ${settings.theme === 'light' ? 'claro' : 'oscuro'} activado`
                      }
                    </span>
                    <button
                      onClick={toggleTheme}
                      className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500"
                    >
                      {settings.theme === 'light' ? t('dark') : t('light')}
                    </button>
                  </div>
                </div>

                <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                    {t('compactView')}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Reduce el espaciado entre elementos para mostrar más contenido en la pantalla.
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {settings.compactView ? t('enable') : t('disable')}
                    </span>
                    <button
                      onClick={() => updateSetting('compactView', !settings.compactView)}
                      className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        settings.compactView ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          settings.compactView ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Language Settings */}
            {activeTab === 'language' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <LanguageIcon className="h-5 w-5 mr-2 text-gray-400" />
                    {t('language')}
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <button
                      onClick={() => updateSetting('language', 'es')}
                      className={`flex items-center p-4 rounded-lg border-2 transition-all ${
                        settings.language === 'es'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <span className="text-2xl mr-3">🇪🇸</span>
                      <div className="text-left">
                        <p className="font-medium text-gray-900 dark:text-white">{t('spanish')}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Español</p>
                      </div>
                    </button>

                    <button
                      onClick={() => updateSetting('language', 'en')}
                      className={`flex items-center p-4 rounded-lg border-2 transition-all ${
                        settings.language === 'en'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      <span className="text-2xl mr-3">🇺🇸</span>
                      <div className="text-left">
                        <p className="font-medium text-gray-900 dark:text-white">{t('english')}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">English</p>
                      </div>
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Idioma actual: {settings.language === 'es' ? 'Español' : 'English'}
                    </span>
                    <button
                      onClick={toggleLanguage}
                      className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-500"
                    >
                      {settings.language === 'es' ? t('english') : t('spanish')}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Settings */}
            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <div className="bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 p-4">
                  <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                    <DocumentArrowDownIcon className="h-5 w-5 mr-2 text-gray-400" />
                    {t('dataExport')}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {t('exportHint')}. Se descargará un archivo JSON con todas tus notas, tareas y configuraciones.
                  </p>
                  
                  {exportMessage && (
                    <div className={`mb-4 p-3 rounded-lg flex items-center ${
                      exportMessage.includes(t('success')) 
                        ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                        : 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                    }`}>
                      {exportMessage.includes(t('success')) ? (
                        <CheckCircleIcon className="h-5 w-5 mr-2" />
                      ) : (
                        <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                      )}
                      <p className="text-sm">{exportMessage}</p>
                    </div>
                  )}
                  
                  <button
                    onClick={handleExportData}
                    disabled={exporting}
                    className={`w-full flex justify-center items-center px-4 py-3 rounded-lg font-medium ${
                      exporting
                        ? 'bg-gray-200 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    {exporting ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Exportando...
                      </>
                    ) : (
                      <>
                        <DocumentArrowDownIcon className="h-5 w-5 mr-2" />
                        {t('export')} {t('dataExport').toLowerCase()}
                      </>
                    )}
                  </button>
                </div>

                <div className="bg-white dark:bg-gray-700 rounded-lg border border-red-200 dark:border-red-900 p-4">
                  <h4 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-4 flex items-center">
                    <TrashIcon className="h-5 w-5 mr-2" />
                    {t('deleteAccount')}
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {t('deleteWarning')}. Se eliminarán todas tus notas, tareas y datos personales permanentemente.
                  </p>
                  
                  {deleteMessage && (
                    <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-lg flex items-center">
                      <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                      <p className="text-sm">{deleteMessage}</p>
                    </div>
                  )}
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Para confirmar, escribe <span className="font-bold">ELIMINAR</span>:
                    </label>
                    <input
                      type="text"
                      value={deleteConfirm}
                      onChange={(e) => setDeleteConfirm(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-600 text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="ELIMINAR"
                    />
                  </div>
                  
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleting || deleteConfirm !== 'ELIMINAR'}
                    className={`w-full flex justify-center items-center px-4 py-3 rounded-lg font-medium ${
                      deleteConfirm !== 'ELIMINAR' || deleting
                        ? 'bg-gray-200 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
                        : 'bg-red-600 text-white hover:bg-red-700'
                    }`}
                  >
                    {deleting ? (
                      <>
                        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Eliminando...
                      </>
                    ) : (
                      <>
                        <TrashIcon className="h-5 w-5 mr-2" />
                        {t('delete')} {t('deleteAccount').toLowerCase()}
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500 dark:text-gray-400">
                {t('theme')}: {settings.theme} • {t('language')}: {settings.language === 'es' ? 'ES' : 'EN'}
              </div>
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;