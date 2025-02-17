/*
  # Création de l'utilisateur administrateur par défaut

  1. Modifications
    - Ajout d'un utilisateur administrateur avec:
      - Email: admin@archivesystem.com
      - Mot de passe: Admin123!
*/

-- Création de l'utilisateur administrateur
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  role,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  gen_random_uuid(),
  'admin@archivesystem.com',
  crypt('Admin123!', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}',
  '{}',
  now(),
  now(),
  'authenticated',
  '',
  '',
  '',
  ''
);

-- Ajout du profil administrateur
INSERT INTO public.profiles (
  id,
  email,
  role,
  created_at,
  last_login
) 
SELECT 
  id,
  email,
  'admin',
  created_at,
  created_at
FROM auth.users 
WHERE email = 'admin@archivesystem.com';