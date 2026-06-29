import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'net.stablesea.runscope',
  appName: 'RunScope',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    hostname: 'runscope.stablesea.net'
  },
};

export default config;
