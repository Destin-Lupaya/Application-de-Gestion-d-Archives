/*
  # Correction de l'authentification et de la création de profil

  1. Changements
    - Ajout d'un trigger pour créer automatiquement le profil utilisateur
    - Mise à jour du compte administrateur
    - Ajout d'une politique pour permettre l'insertion dans la table profiles

  Note: Cette migration assure la création automatique des profils lors de l'inscription
*/

-- Création du trigger pour créer automatiquement le profil utilisateur
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, documents_count, created_at, last_login)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    0,
    NEW.created_at,
    NEW.created_at
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Suppression du trigger s'il existe déjà
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Création du trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Ajout d'une politique pour permettre l'insertion dans la table profiles
CREATE POLICY "Trigger can create profiles"
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Suppression et recréation du compte administrateur
DO $$ 
BEGIN
  -- Suppression dans le bon ordre pour respecter les contraintes de clé étrangère
  DELETE FROM public.profiles WHERE email = 'admin@archivesystem.com';
  DELETE FROM auth.users WHERE email = 'admin@archivesystem.com';

  -- Création du nouvel utilisateur administrateur
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    gen_random_uuid(),
    'authenticated',
    'authenticated',
    'admin@archivesystem.com',
    crypt('Admin123!', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"role": "admin"}',
    now(),
    now()
  );
END $$;