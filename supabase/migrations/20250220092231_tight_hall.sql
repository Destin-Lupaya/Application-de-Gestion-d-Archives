/*
  # Mise à jour du schéma pour les nouvelles fonctionnalités

  1. Nouvelles Tables
    - `user_profiles` : Informations détaillées des utilisateurs
      - `id` (uuid, clé primaire)
      - `user_id` (uuid, référence vers profiles)
      - `avatar_url` (text)
      - `phone_number` (text)
      - `role_type` (text)
      - `offline_access` (boolean)
      - `last_sync` (timestamptz)

    - `contacts` : Répertoire des contacts
      - `id` (uuid, clé primaire)
      - `user_id` (uuid, référence vers profiles)
      - `name` (text)
      - `phone_number` (text)
      - `email` (text)
      - `created_at` (timestamptz)

    - `offline_documents` : Documents en attente de synchronisation
      - `id` (uuid, clé primaire)
      - `user_id` (uuid, référence vers profiles)
      - `document_data` (jsonb)
      - `created_at` (timestamptz)
      - `synced` (boolean)

  2. Modifications
    - Ajout du champ `role_type` dans la table `profiles`
    - Ajout des politiques de sécurité pour les nouvelles tables

  3. Sécurité
    - Activation de RLS pour toutes les nouvelles tables
    - Politiques pour la gestion des rôles et des accès
*/

-- Extension pour la gestion des UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Ajout du champ role_type dans profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS role_type text DEFAULT 'user' 
CHECK (role_type IN ('admin', 'caissier', 'archiviste', 'financier', 'enregistreur', 'user'));

-- Table des profils utilisateurs étendus
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  avatar_url text,
  phone_number text,
  role_type text DEFAULT 'user',
  offline_access boolean DEFAULT false,
  last_sync timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des contacts
CREATE TABLE IF NOT EXISTS contacts (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  name text NOT NULL,
  phone_number text,
  email text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Table des documents hors ligne
CREATE TABLE IF NOT EXISTS offline_documents (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  document_data jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  synced boolean DEFAULT false,
  synced_at timestamptz
);

-- Activation de RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE offline_documents ENABLE ROW LEVEL SECURITY;

-- Politiques pour user_profiles
CREATE POLICY "Users can view their own extended profile"
  ON user_profiles
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update their own extended profile"
  ON user_profiles
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage all extended profiles"
  ON user_profiles
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Politiques pour contacts
CREATE POLICY "Users can manage their own contacts"
  ON contacts
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Politiques pour offline_documents
CREATE POLICY "Users can manage their own offline documents"
  ON offline_documents
  FOR ALL
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Fonction pour mettre à jour le timestamp de dernière modification
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers pour updated_at
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_contacts_updated_at
  BEFORE UPDATE ON contacts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_offline_documents_user_id ON offline_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_offline_documents_synced ON offline_documents(synced);