import Constants from 'expo-constants';

// Minimal runtime config helper
interface AppConfig {
  apiBaseUrl: string;
  apiTimeout: number;
}

const manifestExtra: any = Constants?.expoConfig?.extra || Constants?.manifest?.extra || {};

function readEnv(name: string, fallback?: string): string | undefined {
  // In Expo EAS / runtime, process.env.* may be undefined; prefer manifest extra
  return (manifestExtra && manifestExtra[name]) || process.env[name] || fallback;
}

export const config: AppConfig = {
  apiBaseUrl: readEnv('API_BASE_URL', 'https://placeholder.api')!,
  apiTimeout: parseInt(readEnv('API_TIMEOUT', '15000') || '15000', 10),
};

export function getApiBaseUrl() { return config.apiBaseUrl; }
