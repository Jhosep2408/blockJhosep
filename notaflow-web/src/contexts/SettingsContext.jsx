// src/contexts/SettingsContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';

const SettingsContext = createContext();

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState({
    theme: 'light',
    language: 'es',
    notifications: true,
    emailNotifications: true,
    compactView: false,
  });

  // Cargar configuraciones del localStorage al iniciar
  useEffect(() => {
    const savedSettings = localStorage.getItem('appSettings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setSettings(parsedSettings);
      
      // Aplicar tema inmediatamente
      if (parsedSettings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, []);

  // Guardar configuraciones en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
    
    // Aplicar tema al body
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings]);

  const updateSetting = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const toggleTheme = () => {
    setSettings(prev => ({
      ...prev,
      theme: prev.theme === 'light' ? 'dark' : 'light'
    }));
  };

  const toggleLanguage = () => {
    setSettings(prev => ({
      ...prev,
      language: prev.language === 'es' ? 'en' : 'es'
    }));
  };

  const translations = {
    es: {
      // Dashboard
      welcome: 'Bienvenido de nuevo',
      user: 'Usuario',
      notes: 'Notas',
      tasks: 'Tareas',
      total: 'Total',
      completed: 'Completadas',
      pending: 'Pendientes',
      overdue: 'Vencidas',
      thisMonth: 'este mes',
      noCompletedTasks: 'Sin tareas completadas',
      needAttention: 'Requieren atención',
      urgentAttention: '¡Requieren atención urgente!',
      allUpToDate: 'Todo al día',
      recentActivity: 'Actividad Reciente',
      quickActions: 'Acciones Rápidas',
      viewAll: 'Ver todo',
      newNote: 'Nueva Nota',
      captureIdea: 'Captura una idea rápida',
      newTask: 'Nueva Tarea',
      addTask: 'Agregar una tarea pendiente',
      profile: 'Perfil',
      editProfile: 'Editar información personal',
      myNotes: 'Mis Notas',
      myTasks: 'Mis Tareas',
      dayTip: 'Consejo del día',
      tipContent: 'Usa etiquetas para organizar tus notas y encuentra información más rápido.',
      noRecentActivity: 'No hay actividad reciente',
      note: 'Nota',
      task: 'Tarea',
      created: 'creada',
      updated: 'actualizada',
      
      // Temas
      lightMode: 'Modo claro',
      darkMode: 'Modo oscuro',
      
      // Perfil
      myProfile: 'Mi Perfil',
      manageInfo: 'Administra tu información personal',
      personalInfo: 'Información Personal',
      fullName: 'Nombre completo',
      email: 'Correo electrónico',
      phone: 'Teléfono',
      location: 'Ubicación',
      changePassword: 'Cambiar Contraseña',
      passwordHint: 'Deja estos campos en blanco si no quieres cambiar la contraseña',
      currentPassword: 'Contraseña actual',
      newPassword: 'Nueva contraseña',
      confirmPassword: 'Confirmar nueva contraseña',
      profilePhoto: 'Foto de Perfil',
      changePhoto: 'Cambiar foto',
      photoHint: 'PNG, JPG o GIF. Máximo 2MB',
      cancel: 'Cancelar',
      saveChanges: 'Guardar cambios',
      saving: 'Guardando...',
      
      // Configuración
      settings: 'Configuración',
      appearance: 'Apariencia',
      language: 'Idioma',
      notifications: 'Notificaciones',
      emailNotifications: 'Notificaciones por correo',
      compactView: 'Vista compacta',
      privacy: 'Privacidad',
      dataExport: 'Exportar datos',
      exportHint: 'Descarga una copia de tus datos',
      deleteAccount: 'Eliminar cuenta',
      deleteWarning: 'Esta acción no se puede deshacer',
      theme: 'Tema',
      light: 'Claro',
      dark: 'Oscuro',
      system: 'Sistema',
      spanish: 'Español',
      english: 'Inglés',
      enable: 'Habilitar',
      disable: 'Deshabilitar',
      export: 'Exportar',
      delete: 'Eliminar',
      
      // Notificaciones
      success: '¡Éxito!',
      error: 'Error',
      updatedSuccessfully: 'Actualizado correctamente',
      somethingWentWrong: 'Algo salió mal',
      
      // Comunes
      loading: 'Cargando...',
      search: 'Buscar',
      filter: 'Filtrar',
      sort: 'Ordenar',
      apply: 'Aplicar',
      reset: 'Restablecer',
      confirm: 'Confirmar',
      yes: 'Sí',
      no: 'No',
      close: 'Cerrar',
      open: 'Abrir',
      edit: 'Editar',
      delete: 'Eliminar',
      save: 'Guardar',
      update: 'Actualizar',
      create: 'Crear',
      add: 'Agregar',
      remove: 'Remover',
      select: 'Seleccionar',
      selected: 'Seleccionado',
      all: 'Todos',
      none: 'Ninguno',
      optional: 'Opcional',
      required: 'Requerido',
      invalid: 'Inválido',
      valid: 'Válido',
      error: 'Error',
      warning: 'Advertencia',
      info: 'Información',
      success: 'Éxito',
      
      // Prioridades
      priority: 'Prioridad',
      high: 'Alta',
      medium: 'Media',
      low: 'Baja',
      
      // Estados
      status: 'Estado',
      pending: 'Pendiente',
      inProgress: 'En progreso',
      completed: 'Completada',
      
      // Fechas
      today: 'Hoy',
      yesterday: 'Ayer',
      tomorrow: 'Mañana',
      thisWeek: 'Esta semana',
      lastWeek: 'La semana pasada',
      thisMonth: 'Este mes',
      lastMonth: 'El mes pasado',
      thisYear: 'Este año',
      lastYear: 'El año pasado',
      
      // Acciones
      view: 'Ver',
      preview: 'Vista previa',
      download: 'Descargar',
      upload: 'Subir',
      print: 'Imprimir',
      share: 'Compartir',
      copy: 'Copiar',
      paste: 'Pegar',
      cut: 'Cortar',
      undo: 'Deshacer',
      redo: 'Rehacer',
      
      // Auth
      login: 'Iniciar sesión',
      logout: 'Cerrar sesión',
      register: 'Registrarse',
      forgotPassword: '¿Olvidaste tu contraseña?',
      resetPassword: 'Restablecer contraseña',
      rememberMe: 'Recordarme',
      username: 'Nombre de usuario',
      password: 'Contraseña',
      confirmPassword: 'Confirmar contraseña',
      currentPassword: 'Contraseña actual',
      newPassword: 'Nueva contraseña',
      
      // Navigation
      home: 'Inicio',
      dashboard: 'Dashboard',
      menu: 'Menú',
      navigation: 'Navegación',
      back: 'Atrás',
      forward: 'Adelante',
      refresh: 'Actualizar',
      homePage: 'Página principal',
      settings: 'Configuración',
      profile: 'Perfil',
      help: 'Ayuda',
      about: 'Acerca de',
      contact: 'Contacto',
      support: 'Soporte',
      documentation: 'Documentación',
      terms: 'Términos',
      privacy: 'Privacidad',
      cookies: 'Cookies',
      
      // Time
      second: 'segundo',
      minute: 'minuto',
      hour: 'hora',
      day: 'día',
      week: 'semana',
      month: 'mes',
      year: 'año',
      now: 'ahora',
      later: 'después',
      soon: 'pronto',
      never: 'nunca',
      
      // Numbers
      zero: 'cero',
      one: 'uno',
      two: 'dos',
      three: 'tres',
      four: 'cuatro',
      five: 'cinco',
      six: 'seis',
      seven: 'siete',
      eight: 'ocho',
      nine: 'nueve',
      ten: 'diez',
      
      // Colors
      color: 'Color',
      red: 'Rojo',
      green: 'Verde',
      blue: 'Azul',
      yellow: 'Amarillo',
      orange: 'Naranja',
      purple: 'Morado',
      pink: 'Rosa',
      brown: 'Marrón',
      black: 'Negro',
      white: 'Blanco',
      gray: 'Gris',
    },
    en: {
      // Dashboard
      welcome: 'Welcome back',
      user: 'User',
      notes: 'Notes',
      tasks: 'Tasks',
      total: 'Total',
      completed: 'Completed',
      pending: 'Pending',
      overdue: 'Overdue',
      thisMonth: 'this month',
      noCompletedTasks: 'No completed tasks',
      needAttention: 'Need attention',
      urgentAttention: 'Require urgent attention!',
      allUpToDate: 'All up to date',
      recentActivity: 'Recent Activity',
      quickActions: 'Quick Actions',
      viewAll: 'View all',
      newNote: 'New Note',
      captureIdea: 'Capture a quick idea',
      newTask: 'New Task',
      addTask: 'Add a pending task',
      profile: 'Profile',
      editProfile: 'Edit personal information',
      myNotes: 'My Notes',
      myTasks: 'My Tasks',
      dayTip: 'Tip of the day',
      tipContent: 'Use tags to organize your notes and find information faster.',
      noRecentActivity: 'No recent activity',
      note: 'Note',
      task: 'Task',
      created: 'created',
      updated: 'updated',
      
      // Temas
      lightMode: 'Light mode',
      darkMode: 'Dark mode',
      
      // Perfil
      myProfile: 'My Profile',
      manageInfo: 'Manage your personal information',
      personalInfo: 'Personal Information',
      fullName: 'Full name',
      email: 'Email',
      phone: 'Phone',
      location: 'Location',
      changePassword: 'Change Password',
      passwordHint: 'Leave these fields blank if you don\'t want to change the password',
      currentPassword: 'Current password',
      newPassword: 'New password',
      confirmPassword: 'Confirm new password',
      profilePhoto: 'Profile Photo',
      changePhoto: 'Change photo',
      photoHint: 'PNG, JPG or GIF. Max 2MB',
      cancel: 'Cancel',
      saveChanges: 'Save changes',
      saving: 'Saving...',
      
      // Configuración
      settings: 'Settings',
      appearance: 'Appearance',
      language: 'Language',
      notifications: 'Notifications',
      emailNotifications: 'Email notifications',
      compactView: 'Compact view',
      privacy: 'Privacy',
      dataExport: 'Export data',
      exportHint: 'Download a copy of your data',
      deleteAccount: 'Delete account',
      deleteWarning: 'This action cannot be undone',
      theme: 'Theme',
      light: 'Light',
      dark: 'Dark',
      system: 'System',
      spanish: 'Spanish',
      english: 'English',
      enable: 'Enable',
      disable: 'Disable',
      export: 'Export',
      delete: 'Delete',
      
      // Notificaciones
      success: 'Success!',
      error: 'Error',
      updatedSuccessfully: 'Updated successfully',
      somethingWentWrong: 'Something went wrong',
      
      // Comunes
      loading: 'Loading...',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      apply: 'Apply',
      reset: 'Reset',
      confirm: 'Confirm',
      yes: 'Yes',
      no: 'No',
      close: 'Close',
      open: 'Open',
      edit: 'Edit',
      delete: 'Delete',
      save: 'Save',
      update: 'Update',
      create: 'Create',
      add: 'Add',
      remove: 'Remove',
      select: 'Select',
      selected: 'Selected',
      all: 'All',
      none: 'None',
      optional: 'Optional',
      required: 'Required',
      invalid: 'Invalid',
      valid: 'Valid',
      error: 'Error',
      warning: 'Warning',
      info: 'Info',
      success: 'Success',
      
      // Prioridades
      priority: 'Priority',
      high: 'High',
      medium: 'Medium',
      low: 'Low',
      
      // Estados
      status: 'Status',
      pending: 'Pending',
      inProgress: 'In progress',
      completed: 'Completed',
      
      // Fechas
      today: 'Today',
      yesterday: 'Yesterday',
      tomorrow: 'Tomorrow',
      thisWeek: 'This week',
      lastWeek: 'Last week',
      thisMonth: 'This month',
      lastMonth: 'Last month',
      thisYear: 'This year',
      lastYear: 'Last year',
      
      // Acciones
      view: 'View',
      preview: 'Preview',
      download: 'Download',
      upload: 'Upload',
      print: 'Print',
      share: 'Share',
      copy: 'Copy',
      paste: 'Paste',
      cut: 'Cut',
      undo: 'Undo',
      redo: 'Redo',
      
      // Auth
      login: 'Login',
      logout: 'Logout',
      register: 'Register',
      forgotPassword: 'Forgot password?',
      resetPassword: 'Reset password',
      rememberMe: 'Remember me',
      username: 'Username',
      password: 'Password',
      confirmPassword: 'Confirm password',
      currentPassword: 'Current password',
      newPassword: 'New password',
      
      // Navigation
      home: 'Home',
      dashboard: 'Dashboard',
      menu: 'Menu',
      navigation: 'Navigation',
      back: 'Back',
      forward: 'Forward',
      refresh: 'Refresh',
      homePage: 'Home page',
      settings: 'Settings',
      profile: 'Profile',
      help: 'Help',
      about: 'About',
      contact: 'Contact',
      support: 'Support',
      documentation: 'Documentation',
      terms: 'Terms',
      privacy: 'Privacy',
      cookies: 'Cookies',
      
      // Time
      second: 'second',
      minute: 'minute',
      hour: 'hour',
      day: 'day',
      week: 'week',
      month: 'month',
      year: 'year',
      now: 'now',
      later: 'later',
      soon: 'soon',
      never: 'never',
      
      // Numbers
      zero: 'zero',
      one: 'one',
      two: 'two',
      three: 'three',
      four: 'four',
      five: 'five',
      six: 'six',
      seven: 'seven',
      eight: 'eight',
      nine: 'nine',
      ten: 'ten',
      
      // Colors
      color: 'Color',
      red: 'Red',
      green: 'Green',
      blue: 'Blue',
      yellow: 'Yellow',
      orange: 'Orange',
      purple: 'Purple',
      pink: 'Pink',
      brown: 'Brown',
      black: 'Black',
      white: 'White',
      gray: 'Gray',
    }
  };

  // Función de traducción con soporte para textos anidados y valores por defecto
  const t = (key, defaultValue = '') => {
    const keys = key.split('.');
    let value = translations[settings.language];
    
    for (const k of keys) {
      if (value && value[k] !== undefined) {
        value = value[k];
      } else {
        // Si no encuentra la traducción, devuelve el valor por defecto o la clave
        return defaultValue || key;
      }
    }
    
    return value || defaultValue || key;
  };

  return (
    <SettingsContext.Provider value={{
      settings,
      updateSetting,
      toggleTheme,
      toggleLanguage,
      t
    }}>
      {children}
    </SettingsContext.Provider>
  );
};