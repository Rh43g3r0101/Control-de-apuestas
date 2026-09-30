import { initializeApp, getApps } from 'firebase/app';
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  signOut 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

export const SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.file',
  'https://www.googleapis.com/auth/drive.readonly',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/spreadsheets.readonly',
];

export interface GoogleUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const auth = getAuth(app);

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => {
  provider.addScope(scope);
});

// Cache in-memory only (Never in localStorage or sessionStorage)
let cachedAccessToken: string | null = null;
let cachedUser: GoogleUser | null = null;
let isSigningIn = false;
let authListeners: Array<(user: GoogleUser | null, token: string | null) => void> = [];

declare global {
  interface Window {
    google?: any;
  }
}

/**
 * Asegura que la librería de Google Identity Services esté cargada en la página
 */
async function ensureGsiLoaded(): Promise<void> {
  if (typeof window !== 'undefined' && window.google?.accounts?.oauth2) {
    return;
  }

  return new Promise((resolve, reject) => {
    if (typeof document === 'undefined') return resolve();

    const existing = document.querySelector('script[src*="accounts.google.com/gsi/client"]');
    if (existing) {
      let checks = 0;
      const interval = setInterval(() => {
        checks++;
        if (window.google?.accounts?.oauth2) {
          clearInterval(interval);
          resolve();
        } else if (checks > 40) {
          clearInterval(interval);
          resolve();
        }
      }, 50);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('No se pudo cargar Google Identity Services'));
    document.head.appendChild(script);
  });
}

function notifyAuthChange(user: GoogleUser | null, token: string | null) {
  authListeners.forEach((listener) => listener(user, token));
}

/**
 * Autenticación mediante Google Identity Services (GIS) Token Client.
 * No requiere que la Identity Toolkit API esté habilitada en el proyecto de Google Cloud.
 */
async function signInWithGis(): Promise<{ user: GoogleUser; accessToken: string }> {
  await ensureGsiLoaded();

  if (!window.google?.accounts?.oauth2) {
    throw new Error('Google Identity Services no está disponible en este momento');
  }

  return new Promise((resolve, reject) => {
    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: firebaseConfig.oAuthClientId,
        scope: SCOPES.join(' '),
        callback: async (tokenResponse: any) => {
          if (tokenResponse.error) {
            reject(new Error(tokenResponse.error_description || tokenResponse.error));
            return;
          }

          const accessToken = tokenResponse.access_token;
          if (!accessToken) {
            reject(new Error('No se recibió el token de acceso de Google'));
            return;
          }

          cachedAccessToken = accessToken;

          // Obtener información del usuario con el token de acceso
          let user: GoogleUser = {
            uid: 'google-user',
            email: null,
            displayName: 'Usuario de Google',
            photoURL: null,
          };

          try {
            const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
              headers: { Authorization: `Bearer ${accessToken}` },
            });
            if (userInfoRes.ok) {
              const u = await userInfoRes.json();
              user = {
                uid: u.sub || 'google-user',
                email: u.email || null,
                displayName: u.name || u.email || 'Usuario de Google',
                photoURL: u.picture || null,
              };
            }
          } catch (e) {
            console.warn('No se pudo obtener el perfil de userinfo, usando datos básicos:', e);
          }

          cachedUser = user;
          notifyAuthChange(cachedUser, cachedAccessToken);
          resolve({ user, accessToken });
        },
        error_callback: (err: any) => {
          reject(new Error(err?.message || 'Error en el diálogo de autenticación de Google'));
        },
      });

      client.requestAccessToken({ prompt: '' });
    } catch (err: any) {
      reject(err);
    }
  });
}

export const initAuth = (
  onAuthSuccess?: (user: GoogleUser, token: string) => void,
  onAuthFailure?: () => void
) => {
  const listener = (user: GoogleUser | null, token: string | null) => {
    if (user && token) {
      if (onAuthSuccess) onAuthSuccess(user, token);
    } else {
      if (onAuthFailure) onAuthFailure();
    }
  };

  authListeners.push(listener);

  // Inicializar estado de Firebase Auth si existe sesión previa
  const unsubscribeFirebase = onAuthStateChanged(auth, async (fbUser) => {
    if (fbUser && cachedAccessToken) {
      cachedUser = {
        uid: fbUser.uid,
        email: fbUser.email,
        displayName: fbUser.displayName,
        photoURL: fbUser.photoURL,
      };
      listener(cachedUser, cachedAccessToken);
    } else if (cachedUser && cachedAccessToken) {
      listener(cachedUser, cachedAccessToken);
    } else if (!isSigningIn) {
      listener(null, null);
    }
  });

  return () => {
    authListeners = authListeners.filter((l) => l !== listener);
    unsubscribeFirebase();
  };
};

/**
 * Inicia sesión con Google.
 * Si Identity Toolkit API no está habilitada en Firebase, utiliza automáticamente
 * Google Identity Services con el Client ID de OAuth del proyecto.
 */
export const googleSignIn = async (): Promise<{ user: GoogleUser; accessToken: string } | null> => {
  try {
    isSigningIn = true;

    // Directamente usamos GIS Token Client ya que en este proyecto
    // Identity Toolkit API no está activada en Google Cloud Console.
    return await signInWithGis();
  } catch (error: any) {
    // Si falla GIS, intentar Firebase Auth como fallback
    try {
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential?.accessToken) {
        cachedAccessToken = credential.accessToken;
        cachedUser = {
          uid: result.user.uid,
          email: result.user.email,
          displayName: result.user.displayName,
          photoURL: result.user.photoURL,
        };
        notifyAuthChange(cachedUser, cachedAccessToken);
        return { user: cachedUser, accessToken: cachedAccessToken };
      }
    } catch (fbErr: any) {
      console.warn('Firebase Auth fallback también falló:', fbErr);
    }

    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const googleLogout = async () => {
  try {
    await signOut(auth);
  } catch (e) {
    // ignore
  }
  cachedAccessToken = null;
  cachedUser = null;
  notifyAuthChange(null, null);
};
