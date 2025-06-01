import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations directly
import enTranslation from './locales/en/translation.json';
import esTranslation from './locales/es/translation.json';

const resources = {
  en: {
    translation: enTranslation || {
      common: {
        loading: 'Loading...',
        submit: 'Submit',
        cancel: 'Cancel',
        save: 'Save',
        delete: 'Delete',
        edit: 'Edit',
        viewDetails: 'View Details',
        actions: 'Actions',
        filtersTitle: 'Filters',
        noResaleRate: 'No resale rate set',
        back: 'Back',
        start: 'Start',
        stop: 'Stop',
        error: 'Error',
        success: 'Success'
      },
      home: {
        title: 'MaterialFlow Dashboard',
        subtitle: 'Professional Material Ticketing & Workflow Management System',
        automate: 'Automate your',
        devMode: 'Dev Mode',
        toggleDevMode: 'Toggle Developer Mode',
        testLogin: 'Test Login',
        poLogin: 'PO Login',
        truckerLogin: 'Trucker Login'
      },
      navigation: {
        administration: 'Administration',
        adminDesc: 'Manage system settings and user accounts',
        materialTicketing: 'Material Ticketing',
        ticketingDesc: 'Upload, manage, and process material tickets',
        purchaseOrders: 'Purchase Orders',
        poDesc: 'Create and manage purchase orders',
        mtoFlagship: "MTO's Flagship",
        mtoDesc: 'Advanced management suite (Admin Access Required)',
        truckerLogin: 'Trucker Login',
        truckerDesc: 'View your stats and history',
        materialTicketHistory: 'Material Ticket History'
      },
      ticket: {
        create: 'Create Ticket',
        edit: 'Edit Ticket',
        pickupLocation: 'Pickup Location',
        dropoffLocation: 'Dropoff Location',
        materialType: 'Material Type',
        quantity: 'Quantity',
        unit: 'Unit',
        notes: 'Notes'
      },
      po: {
        create: 'Create Purchase Order',
        edit: 'Edit Purchase Order',
        approve: 'Approve Purchase Order',
        reject: 'Reject Purchase Order',
        status: 'Status',
        haulerRates: 'Hauler Rates',
        resaleRates: 'Resale Rates',
        clientApproval: 'Client Approval',
        jobDetails: 'Job Details',
        list: 'Purchase Orders',
        client: 'Client',
        hauler: 'Hauler',
        createdAt: 'Created At',
        addRate: 'Add Rate',
        rate: 'Rate',
        location: 'Location',
        pickupLocation: 'Pickup Location',
        dropoffLocation: 'Dropoff Location',
        pendingApproval: 'Pending Client Approval',
        approved: 'Approved',
        rejected: 'Rejected',
        clientRates: 'Client Rates',
        addClientRate: 'Add Client Rate',
        poNumber: 'PO Number',
        referenceNumber: 'Reference Number',
        statuses: {
          pending: 'Pending',
          approved: 'Approved',
          rejected: 'Rejected'
        },
        filtersTitle: 'Filters',
        noResaleRate: 'No resale rate set'
      },
      geofencing: {
        manageGeofences: 'Manage Geofences',
        type: 'Type',
        pickupGeofence: 'Pickup Geofence',
        dropoffGeofence: 'Dropoff Geofence',
        latitude: 'Latitude',
        longitude: 'Longitude',
        radius: 'Radius (meters)',
        activeGeofences: 'Active Geofences',
        locationRequired: 'Location is required',
        invalidLocation: 'Invalid location',
        geofenceValidation: 'Geofence Validation',
        withinGeofence: 'Location is within geofence',
        outsideGeofence: 'Location is outside geofence'
      },
      auth: {
        login: 'Login',
        register: 'Register',
        logout: 'Logout',
        email: 'Email',
        password: 'Password',
        confirmPassword: 'Confirm Password',
        name: 'Name',
        role: 'Role',
        hauler: 'Hauler',
        client: 'Client',
        noAccount: "Don't have an account?",
        haveAccount: 'Already have an account?',
        passwordsDoNotMatch: 'Passwords do not match',
        registrationFailed: 'Registration failed',
        loginFailed: 'Login failed',
        dummyAccountsTitle: 'Test Accounts:',
        dummyViewer: 'Viewer',
        dummyEditor: 'Editor'
      }
    }
  },
  es: {
    translation: esTranslation || {
      common: {
        loading: 'Cargando...',
        submit: 'Enviar',
        cancel: 'Cancelar',
        save: 'Guardar',
        delete: 'Eliminar',
        edit: 'Editar',
        view: 'Ver',
        actions: 'Acciones',
        back: 'Atrás',
        start: 'Iniciar',
        stop: 'Detener',
        error: 'Error',
        success: 'Éxito'
      },
      home: {
        title: 'Panel de Control MaterialFlow',
        subtitle: 'Sistema Profesional de Gestión de Tickets y Flujos de Trabajo',
        automate: 'Automatiza tu',
        devMode: 'Modo Dev',
        toggleDevMode: 'Alternar Modo Desarrollador',
        testLogin: 'Login de Prueba',
        poLogin: 'Login de OC',
        truckerLogin: 'Login de Transportista'
      },
      navigation: {
        administration: 'Administración',
        adminDesc: 'Gestionar configuración y cuentas de usuario',
        materialTicketing: 'Tickets de Material',
        ticketingDesc: 'Subir, gestionar y procesar tickets de material',
        purchaseOrders: 'Órdenes de Compra',
        poDesc: 'Crear y gestionar órdenes de compra',
        mtoFlagship: 'MTO Flagship',
        mtoDesc: 'Suite de gestión avanzada (Se requiere acceso de administrador)',
        truckerLogin: 'Inicio de Sesión de Transportista',
        truckerDesc: 'Ver tus estadísticas e historial',
        materialTicketHistory: 'Historial de Tickets de Material'
      },
      ticket: {
        create: 'Crear Ticket',
        edit: 'Editar Ticket',
        pickupLocation: 'Ubicación de Recogida',
        dropoffLocation: 'Ubicación de Entrega',
        materialType: 'Tipo de Material',
        quantity: 'Cantidad',
        unit: 'Unidad',
        notes: 'Notas'
      },
      po: {
        create: 'Crear Orden de Compra',
        edit: 'Editar Orden de Compra',
        approve: 'Aprobar Orden de Compra',
        reject: 'Rechazar Orden de Compra',
        status: 'Estado',
        haulerRates: 'Tarifas del Transportista',
        resaleRates: 'Tarifas de Reventa',
        clientApproval: 'Aprobación del Cliente',
        jobDetails: 'Detalles del Trabajo',
        list: 'Órdenes de Compra',
        client: 'Cliente',
        hauler: 'Transportista',
        createdAt: 'Creado el',
        addRate: 'Añadir Tarifa',
        rate: 'Tarifa',
        location: 'Ubicación',
        pickupLocation: 'Ubicación de Recogida',
        dropoffLocation: 'Ubicación de Entrega',
        pendingApproval: 'Pendiente de Aprobación del Cliente',
        approved: 'Aprobado',
        rejected: 'Rechazado',
        clientRates: 'Tarifas del Cliente',
        addClientRate: 'Añadir Tarifa del Cliente',
        poNumber: 'Número de OC',
        referenceNumber: 'Número de Referencia',
        statuses: {
          pending: 'Pendiente',
          approved: 'Aprobado',
          rejected: 'Rechazado'
        },
        filtersTitle: 'Filtros',
        noResaleRate: 'No se ha establecido tarifa de reventa'
      },
      geofencing: {
        manageGeofences: 'Gestionar Geocercas',
        type: 'Tipo',
        pickupGeofence: 'Geocerca de Recogida',
        dropoffGeofence: 'Geocerca de Entrega',
        latitude: 'Latitud',
        longitude: 'Longitud',
        radius: 'Radio (metros)',
        activeGeofences: 'Geocercas Activas',
        locationRequired: 'La ubicación es requerida',
        invalidLocation: 'Ubicación inválida',
        geofenceValidation: 'Validación de Geocerca',
        withinGeofence: 'La ubicación está dentro de la geocerca',
        outsideGeofence: 'La ubicación está fuera de la geocerca'
      },
      auth: {
        login: 'Iniciar Sesión',
        register: 'Registrarse',
        logout: 'Cerrar Sesión',
        email: 'Correo Electrónico',
        password: 'Contraseña',
        confirmPassword: 'Confirmar Contraseña',
        name: 'Nombre',
        role: 'Rol',
        hauler: 'Transportista',
        client: 'Cliente',
        noAccount: '¿No tienes una cuenta?',
        haveAccount: '¿Ya tienes una cuenta?',
        passwordsDoNotMatch: 'Las contraseñas no coinciden',
        registrationFailed: 'Error en el registro',
        loginFailed: 'Error al iniciar sesión',
        dummyAccountsTitle: 'Cuentas de Prueba:',
        dummyViewer: 'Visualizador',
        dummyEditor: 'Editor'
      }
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    }
  });

export default i18n; 