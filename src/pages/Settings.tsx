import React, { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Users, Database, Bell, Building2, FileText, MapPin, Globe, Phone, Mail, Image } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import UserManagement from '../components/UserManagement';
import OfflineToggle from '../components/OfflineToggle';
import { useNotifications } from '../context/NotificationContext';

interface CompanySettings {
  name: string;
  registration_number: string;
  tax_number: string;
  national_id: string;
  operation_license: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  logo_url: string | null;
}

const Settings = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();
  const [activeTab, setActiveTab] = useState('company');
  const [loading, setLoading] = useState(true);
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    name: '',
    registration_number: '',
    tax_number: '',
    national_id: '',
    operation_license: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    logo_url: null,
  });
  const [notificationSettings, setNotificationSettings] = useState({
    email_notifications: true,
    sms_notifications: false,
    document_alerts: true,
    security_alerts: true,
  });
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  useEffect(() => {
    if (user) {
      fetchSettings();
    }
  }, [user]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .single();

      if (error) throw error;

      if (data) {
        setCompanySettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('company_settings')
        .upsert(companySettings);

      if (error) throw error;

      addNotification({
        type: 'success',
        title: 'Paramètres enregistrés',
        message: 'Les paramètres de l\'entreprise ont été mis à jour avec succès.',
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de sauvegarder les paramètres.',
      });
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    const file = e.target.files[0];
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('logos')
        .getPublicUrl(fileName);

      setCompanySettings({ ...companySettings, logo_url: publicUrl });
      
      addNotification({
        type: 'success',
        title: 'Logo mis à jour',
        message: 'Le logo de l\'entreprise a été mis à jour avec succès.',
      });
    } catch (error) {
      console.error('Error uploading logo:', error);
      addNotification({
        type: 'error',
        title: 'Erreur',
        message: 'Impossible de télécharger le logo.',
      });
    }
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-gray-500">Veuillez vous connecter pour accéder aux paramètres.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center space-x-2 mb-8">
        <SettingsIcon className="h-6 w-6 text-gray-400" />
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex">
            <button
              onClick={() => setActiveTab('company')}
              className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'company'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Building2 className="h-4 w-4 inline-block mr-2" />
              Entreprise
            </button>
            {user.role === 'admin' && (
              <button
                onClick={() => setActiveTab('users')}
                className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                  activeTab === 'users'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Users className="h-4 w-4 inline-block mr-2" />
                Utilisateurs
              </button>
            )}
            <button
              onClick={() => setActiveTab('notifications')}
              className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'notifications'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Bell className="h-4 w-4 inline-block mr-2" />
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('system')}
              className={`whitespace-nowrap py-4 px-6 border-b-2 font-medium text-sm ${
                activeTab === 'system'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Database className="h-4 w-4 inline-block mr-2" />
              Système
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'company' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                  <h3 className="text-lg font-medium text-gray-900">Configuration de l'entreprise</h3>
                </div>
                <form onSubmit={handleCompanySubmit} className="p-4">
                  <div className={`space-y-4 ${currentStep !== 1 && 'hidden'}`}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        <Building2 className="h-4 w-4 inline-block mr-2" />
                        Nom de l'entreprise
                      </label>
                      <input
                        type="text"
                        value={companySettings.name}
                        onChange={(e) => setCompanySettings({ ...companySettings, name: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        required
                      />
                    </div>
                  </div>

                  <div className={`space-y-4 ${currentStep !== 2 && 'hidden'}`}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        <FileText className="h-4 w-4 inline-block mr-2" />
                        Registre de commerce
                      </label>
                      <input
                        type="text"
                        value={companySettings.registration_number}
                        onChange={(e) => setCompanySettings({ ...companySettings, registration_number: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        <FileText className="h-4 w-4 inline-block mr-2" />
                        Numéro d'impôt
                      </label>
                      <input
                        type="text"
                        value={companySettings.tax_number}
                        onChange={(e) => setCompanySettings({ ...companySettings, tax_number: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        <FileText className="h-4 w-4 inline-block mr-2" />
                        Identification nationale
                      </label>
                      <input
                        type="text"
                        value={companySettings.national_id}
                        onChange={(e) => setCompanySettings({ ...companySettings, national_id: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        <FileText className="h-4 w-4 inline-block mr-2" />
                        Autorisation de fonctionnement
                      </label>
                      <input
                        type="text"
                        value={companySettings.operation_license}
                        onChange={(e) => setCompanySettings({ ...companySettings, operation_license: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className={`space-y-4 ${currentStep !== 3 && 'hidden'}`}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        <MapPin className="h-4 w-4 inline-block mr-2" />
                        Adresse physique
                      </label>
                      <input
                        type="text"
                        value={companySettings.address}
                        onChange={(e) => setCompanySettings({ ...companySettings, address: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        <Phone className="h-4 w-4 inline-block mr-2" />
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        value={companySettings.phone}
                        onChange={(e) => setCompanySettings({ ...companySettings, phone: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        <Mail className="h-4 w-4 inline-block mr-2" />
                        Email
                      </label>
                      <input
                        type="email"
                        value={companySettings.email}
                        onChange={(e) => setCompanySettings({ ...companySettings, email: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        <Globe className="h-4 w-4 inline-block mr-2" />
                        Site web
                      </label>
                      <input
                        type="url"
                        value={companySettings.website}
                        onChange={(e) => setCompanySettings({ ...companySettings, website: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  </div>

                  <div className={`space-y-4 ${currentStep !== 4 && 'hidden'}`}>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        <Image className="h-4 w-4 inline-block mr-2" />
                        Logo
                      </label>
                      <div className="mt-1 flex items-center space-x-4">
                        {companySettings.logo_url && (
                          <img
                            src={companySettings.logo_url}
                            alt="Logo"
                            className="h-12 w-12 object-contain"
                          />
                        )}
                        <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                          Choisir un fichier
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={handleLogoUpload}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-between">
                    <button
                      type="button"
                      onClick={prevStep}
                      className={`px-4 py-2 text-sm text-gray-700 hover:text-gray-500 ${
                        currentStep === 1 ? 'invisible' : ''
                      }`}
                    >
                      Précédent
                    </button>
                    <div>
                      {currentStep < totalSteps ? (
                        <button
                          type="button"
                          onClick={nextStep}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Suivant
                        </button>
                      ) : (
                        <button
                          type="submit"
                          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Enregistrer
                        </button>
                      )}
                    </div>
                  </div>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'users' && user.role === 'admin' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium text-gray-900">Gestion des utilisateurs</h3>
                <UserManagement onUserCreated={() => {}} />
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                  <h3 className="text-lg font-medium text-gray-900">Paramètres de notification</h3>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Notifications par email</p>
                      <p className="text-sm text-gray-500">Recevoir des notifications par email</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotificationSettings({
                        ...notificationSettings,
                        email_notifications: !notificationSettings.email_notifications,
                      })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                        notificationSettings.email_notifications ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notificationSettings.email_notifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Notifications SMS</p>
                      <p className="text-sm text-gray-500">Recevoir des notifications par SMS</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotificationSettings({
                        ...notificationSettings,
                        sms_notifications: !notificationSettings.sms_notifications,
                      })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                        notificationSettings.sms_notifications ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notificationSettings.sms_notifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Alertes de documents</p>
                      <p className="text-sm text-gray-500">Notifications pour les nouveaux documents</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotificationSettings({
                        ...notificationSettings,
                        document_alerts: !notificationSettings.document_alerts,
                      })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                        notificationSettings.document_alerts ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notificationSettings.document_alerts ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Alertes de sécurité</p>
                      <p className="text-sm text-gray-500">Notifications de sécurité importantes</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNotificationSettings({
                        ...notificationSettings,
                        security_alerts: !notificationSettings.security_alerts,
                      })}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                        notificationSettings.security_alerts ? 'bg-indigo-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notificationSettings.security_alerts ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'system' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="border-b border-gray-200 bg-gray-50 px-4 py-3">
                  <h3 className="text-lg font-medium text-gray-900">Paramètres système</h3>
                </div>
                <div className="p-4">
                  <OfflineToggle
                    enabled={false}
                    onToggle={() => {}}
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;