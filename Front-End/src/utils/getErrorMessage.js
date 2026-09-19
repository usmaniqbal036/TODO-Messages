
export const getErrorMessage = (err, fallback) => {
  const serverMessage = err?.response?.data?.message;
  if (serverMessage) return serverMessage;

  
  if (err?.request && !err?.response) {
    return 'Cannot reach the server. Is the backend running?';
  }

  return fallback;
};
