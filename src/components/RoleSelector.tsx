import React from 'react';
import { UserCog } from 'lucide-react';

interface RoleSelectorProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({
  value,
  onChange,
  disabled = false,
}) => {
  const roles = [
    { value: 'admin', label: 'Administrateur' },
    { value: 'caissier', label: 'Caissier' },
    { value: 'archiviste', label: 'Archiviste' },
    { value: 'financier', label: 'Financier' },
    { value: 'enregistreur', label: 'Enregistreur' },
    { value: 'user', label: 'Utilisateur' },
  ];

  return (
    <div className="space-y-1">
      <label className="block text-sm font-medium text-gray-700">
        <div className="flex items-center space-x-2">
          <UserCog className="h-4 w-4 text-gray-400" />
          <span>Rôle</span>
        </div>
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm disabled:bg-gray-100 disabled:cursor-not-allowed"
      >
        {roles.map((role) => (
          <option key={role.value} value={role.value}>
            {role.label}
          </option>
        ))}
      </select>
    </div>
  );
};

export default RoleSelector;