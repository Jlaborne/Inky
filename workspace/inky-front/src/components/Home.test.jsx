import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import Home from './Home';
import { useAuth } from '../firebase/AuthProvider';
import { signIn } from '../firebase/auth';

// Mock react-router-dom pour pouvoir espionner useNavigate
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
    useNavigate: jest.fn(),
  };
});

// useAuth devient une jest.fn qu'on pourra configurer par test
jest.mock('../firebase/AuthProvider', () => ({
  useAuth: jest.fn(),
}));

// signIn mocké pour éviter Firebase réel
jest.mock('../firebase/auth', () => ({
  signIn: jest.fn(() => Promise.resolve()),
}));

const renderHome = () =>
  render(
    <BrowserRouter>
      <Home />
    </BrowserRouter>
  );

beforeEach(() => {
  // Valeur par défaut : pas connecté
  useAuth.mockReturnValue({
    currentUser: null,
    authLoading: false,
    userRole: null,
  });

  // Par défaut, navigate est un mock vide
  useNavigate.mockReturnValue(jest.fn());

  // On nettoie fetch entre les tests
  global.fetch = undefined;
});

afterEach(() => {
  jest.clearAllMocks();
});

test('affiche le formulaire de connexion avec email et mot de passe', () => {
  renderHome();

  const emailInput = screen.getByLabelText(/email/i);
  const passwordInput = screen.getByLabelText(/mot de passe/i);
  const submitButton = screen.getByRole('button', { name: /connexion/i });

  expect(emailInput).toBeInTheDocument();
  expect(passwordInput).toBeInTheDocument();
  expect(submitButton).toBeInTheDocument();
});

test('passe en mode "Créer un compte" et affiche les champs supplémentaires', async () => {
  renderHome();

  // Bouton de toggle (en haut)
  const createAccountToggle = screen.getByRole('button', { name: /créer un compte/i });
  await userEvent.click(createAccountToggle);

  const lastNameInput = screen.getByLabelText(/nom de famille/i);
  const firstNameInput = screen.getByLabelText(/prénom/i);

  expect(lastNameInput).toBeInTheDocument();
  expect(firstNameInput).toBeInTheDocument();

  // Titre du formulaire
  const heading = screen.getByRole('heading', { name: /créer un compte/i, level: 2 });
  expect(heading).toBeInTheDocument();
});

test('soumet le formulaire de connexion et appelle signIn avec email et mot de passe', async () => {
  renderHome();

  await userEvent.type(screen.getByLabelText(/email/i), 'test@example.com');
  await userEvent.type(screen.getByLabelText(/mot de passe/i), 'MonSuperMotDePasse123');

  const submitButton = screen.getByRole('button', { name: /connexion/i });
  await userEvent.click(submitButton);

  expect(signIn).toHaveBeenCalledTimes(1);
  expect(signIn).toHaveBeenCalledWith('test@example.com', 'MonSuperMotDePasse123');
});

test('soumet le formulaire de création de compte et envoie un POST à /auth/register', async () => {
  // Mock de fetch pour l’inscription
  global.fetch = jest.fn().mockResolvedValue({
    ok: true,
    json: () => Promise.resolve({}),
  });

  renderHome();

  // Passer en mode "Créer un compte"
  const createAccountToggle = screen.getByRole('button', { name: /créer un compte/i });
  await userEvent.click(createAccountToggle);

  // Remplir les champs
  await userEvent.type(screen.getByLabelText(/nom de famille/i), 'Doe');
  await userEvent.type(screen.getByLabelText(/prénom/i), 'John');
  await userEvent.type(screen.getByLabelText(/^email$/i), 'john@example.com');
  await userEvent.type(screen.getByLabelText(/mot de passe/i), 'Secret123!');

  // Il y a 2 boutons "Créer un compte" (toggle + submit)
  // On prend celui du formulaire (type="submit")
  const allCreateButtons = screen.getAllByRole('button', { name: /créer un compte/i });
  const submitButton = allCreateButtons.find((btn) => btn.type === 'submit') || allCreateButtons[1];

  await userEvent.click(submitButton);

  // Vérifier l'appel à fetch
  expect(global.fetch).toHaveBeenCalledTimes(1);
  expect(global.fetch).toHaveBeenCalledWith(
    'http://localhost:5000/auth/register',
    expect.objectContaining({
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        lastName: 'Doe',
        firstName: 'John',
        email: 'john@example.com',
        password: 'Secret123!',
        role: 'user',
      }),
    })
  );

  // Vérifier que le message de succès s'affiche
  const successAlert = await screen.findByText(/user registered successfully!/i);
  expect(successAlert).toBeInTheDocument();
});

test('redirige vers /create-artist quand userRole = "tattoo"', async () => {
  const navigateSpy = jest.fn();
  useNavigate.mockReturnValue(navigateSpy);

  useAuth.mockReturnValue({
    currentUser: { uid: '123' },
    authLoading: false,
    userRole: 'tattoo',
  });

  renderHome();

  await waitFor(() => {
    expect(navigateSpy).toHaveBeenCalledWith('/create-artist');
  });
});

test('redirige vers /artists quand userRole = "user"', async () => {
  const navigateSpy = jest.fn();
  useNavigate.mockReturnValue(navigateSpy);

  useAuth.mockReturnValue({
    currentUser: { uid: '456' },
    authLoading: false,
    userRole: 'user',
  });

  renderHome();

  await waitFor(() => {
    expect(navigateSpy).toHaveBeenCalledWith('/artists');
  });
});
