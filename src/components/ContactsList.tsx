import React, { useState } from 'react';
import { Plus, Trash2, Mail, Phone } from 'lucide-react';
import type { Contact } from '../types';
import PhoneInputField from './PhoneInput';

interface ContactsListProps {
  contacts: Contact[];
  onAddContact: (contact: Omit<Contact, 'id' | 'created_at' | 'updated_at'>) => void;
  onDeleteContact: (id: string) => void;
}

const ContactsList: React.FC<ContactsListProps> = ({
  contacts,
  onAddContact,
  onDeleteContact,
}) => {
  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    phone_number: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newContact.name) {
      onAddContact({
        name: newContact.name,
        email: newContact.email || null,
        phone_number: newContact.phone_number || null,
        user_id: '', // Will be set by the backend
      });
      setNewContact({ name: '', email: '', phone_number: '' });
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Nom
            </label>
            <input
              type="text"
              value={newContact.name}
              onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              value={newContact.email}
              onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            />
          </div>
          <div>
            <PhoneInputField
              label="Téléphone"
              value={newContact.phone_number}
              onChange={(value) => setNewContact({ ...newContact, phone_number: value || '' })}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            Ajouter un contact
          </button>
        </div>
      </form>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {contacts.map((contact) => (
            <li key={contact.id} className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {contact.name}
                  </p>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    {contact.email && (
                      <div className="flex items-center mr-4">
                        <Mail className="h-4 w-4 mr-1" />
                        <span>{contact.email}</span>
                      </div>
                    )}
                    {contact.phone_number && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        <span>{contact.phone_number}</span>
                      </div>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => onDeleteContact(contact.id)}
                  className="ml-4 text-red-600 hover:text-red-900"
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default ContactsList;