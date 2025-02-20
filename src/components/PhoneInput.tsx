import React from 'react';
import PhoneInput from 'react-phone-number-input';
import 'react-phone-number-input/style.css';

interface PhoneInputFieldProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
}

const PhoneInputField: React.FC<PhoneInputFieldProps> = ({
  value,
  onChange,
  label,
  error,
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="mt-1">
        <PhoneInput
          international
          defaultCountry="FR"
          value={value}
          onChange={onChange}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        />
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default PhoneInputField;