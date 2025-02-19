import React from 'react';
import { FileArchive, Shield, Clock, Users } from 'lucide-react';

const About = () => {
  return (
    <div className="max-w-4xl mx-auto mt-8 px-4">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">À propos d'ArchiveSystem</h1>
        <p className="text-lg text-gray-600">
          Une solution moderne et sécurisée pour la gestion de vos documents numériques
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center space-x-4 mb-4">
            <FileArchive className="h-8 w-8 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">Gestion documentaire</h2>
          </div>
          <p className="text-gray-600">
            Organisez et accédez à vos documents de manière efficace avec notre système de classement intuitif.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center space-x-4 mb-4">
            <Shield className="h-8 w-8 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">Sécurité maximale</h2>
          </div>
          <p className="text-gray-600">
            Vos documents sont protégés par des protocoles de sécurité avancés et un système de permissions robuste.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center space-x-4 mb-4">
            <Clock className="h-8 w-8 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">Accès rapide</h2>
          </div>
          <p className="text-gray-600">
            Retrouvez instantanément vos documents grâce à notre système de recherche performant.
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md">
          <div className="flex items-center space-x-4 mb-4">
            <Users className="h-8 w-8 text-indigo-600" />
            <h2 className="text-xl font-semibold text-gray-900">Collaboration</h2>
          </div>
          <p className="text-gray-600">
            Partagez et collaborez sur vos documents avec votre équipe en toute simplicité.
          </p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Notre mission</h2>
        <p className="text-gray-600 mb-6">
          ArchiveSystem a été créé avec l'objectif de simplifier la gestion documentaire pour les entreprises et les particuliers. 
          Notre plateforme combine facilité d'utilisation et sécurité pour vous offrir la meilleure expérience possible.
        </p>
        <p className="text-gray-600">
          Nous nous engageons à fournir une solution fiable et évolutive qui répond aux besoins de gestion documentaire modernes.
        </p>
      </div>
    </div>
  );
};

export default About;