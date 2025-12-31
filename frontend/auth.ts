// Authentication disabled for open-source edition.
// This file remains as a stub so imports do not fail.
export const handlers = {};
export const auth = async () => ({ user: null });
export const signIn = async () => {
  throw new Error('signIn is disabled in this build');
};
export const signOut = async () => {
  throw new Error('signOut is disabled in this build');
};