const path = require('path');

const envToUse = 'LOCAL';
const devUrl = 'https://icp-dashboard.saal.ai';

const envs = {
  LOCAL: {
    '/api/auth/': `/api/auth`,
    '/': devUrl,
  },
};

const envUrls = envs[envToUse];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  basePath: process.env.BASE_URL,
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
  },
  serverRuntimeConfig: {
    KEYCLOAK_URL: process.env.KEYCLOAK_URL,
    KEYCLOAK_REALM: process.env.KEYCLOAK_REALM,
    KEYCLOAK_CLIENT_ID: process.env.KEYCLOAK_CLIENT_ID,
    KEYCLOAK_SECRET: process.env.KEYCLOAK_SECRET,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    BASE_URL: process.env.BASE_URL,
    INTL_FILES_PATH: process.env.INTL_FILES_PATH
  },
  publicRuntimeConfig: {
    // Will be available on both server and client
    KEYCLOAK_ENABLED: process.env.KEYCLOAK_ENABLED,
    CACHE_ENABLED: process.env.CACHE_ENABLED,
    BASE_URL: process.env.BASE_URL,
    FAVICON: process.env.FAVICON,
    APP_LOGO: process.env.APP_LOGO,
    APP_LOGO_DARK: process.env.APP_LOGO_DARK,
    APPLICATION_NAME_ENGLISH: process.env.APPLICATION_NAME_ENGLISH,
    APPLICATION_NAME_ARABIC: process.env.APPLICATION_NAME_ARABIC,
    MATOMO_ID: process.env.MATOMO_ID,
    MATOMO_SITE: process.env.MATOMO_SITE,
  },
  async rewrites() {
    if (process.env.NODE_ENV === 'development') {
      const urls = Object.entries(envUrls)?.map(([keyName, url]) => ({
        source: `${keyName}:path*`,
        destination: `${url}/:path*` // Proxy to Backend
      }))
      return urls;
    }
    return [];
  },
  async redirects() {
    if (process.env.BASE_URL) {
      return [
        {
          source: '/api/auth/callback/keycloak',
          destination: `${process.env.BASE_URL}/api/auth/callback/keycloak`,
          permanent: true,
          basePath: false,
        },
        {
          source: '/',
          destination: process.env.BASE_URL,
          permanent: true,
          basePath: false,
        }
      ]
    }

    return []
  }
}

module.exports = nextConfig
