import { CapacitorConfig } from '@capacitor/cli'

const config: CapacitorConfig = {
  appId:   'net.stablesea.runscope',
  appName: 'RunScope',
  webDir:  'dist',
  server: {
    androidScheme: 'https',
    hostname:      'runscope.stablesea.net',
  },
  android: {
    useLegacyBridge: true,
  },
  plugins: {
    Geolocation: {
      androidForegroundServiceEnabled: true,
      androidForegroundServiceNotificationTitle: 'RunScope is tracking your run',
      androidForegroundServiceNotificationBody: 'Your location is being shared with spectators.',
      androidForegroundServiceNotificationIcon: 'ic_launcher',
    },
    CapacitorHttp: {
        enabled: true,
    },
  },
}

export default config