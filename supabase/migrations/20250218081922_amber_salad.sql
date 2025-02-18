/*
  # Correction du compte administrateur

  1. Changements
    - Suppression et recréation du compte administrateur avec le bon mot de passe
    - Mise à jour du profil administrateur
  
  Note: Gestion correcte des contraintes de clé étrangère en supprimant d'abord
  le profil avant l'utilisateur
*/

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
    crypt('admin', gen_salt('bf')),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{}',
    now(),
    now()
  );

  -- Ajout du profil administrateur
  INSERT INTO public.profiles (
    id,
    email,
    role,
    documents_count,
    created_at,
    last_login
  ) 
  SELECT 
    id,
    email,
    'admin',
    0,
    created_at,
    created_at
  FROM auth.users 
  WHERE email = 'admin@archivesystem.com';
END $$;