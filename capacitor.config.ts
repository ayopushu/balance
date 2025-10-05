import { CapacitorConfig } from '@capacitor/core';

const config: CapacitorConfig = {
  appId: 'app.lovable.ba12cc2c84c248e7b85f06fa1a2bca5e',
  appName: 'balance-your-life-04',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      backgroundColor: '#0B0B0D',
      showSpinner: false,
      androidSplashResourceName: 'splash',
      iosSplashResourceName: 'splash'
    },
    StatusBar: {
      style: 'DARK'
    }
  }
};

export default config;