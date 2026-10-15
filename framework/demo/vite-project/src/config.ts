const requiredEnv = (key: string) => {
  const value = import.meta.env[key];
  if (!value) {
    throw new Error(`Environment variable ${key} is not set`);
  }
  return value;
};

export const config = {
  apiUrl: requiredEnv("VITE_API_URL"),
};
