import getConfig from 'next/config'

const { serverRuntimeConfig } = getConfig()

const {
  KEYCLOAK_URL,
  KEYCLOAK_REALM
} = serverRuntimeConfig;

export default async (req, res) => {
  const redirectUrl = req?.query?.redirectUrl;
  // const idToken = req?.body?.idToken;
  const path = `${KEYCLOAK_URL}realms/${KEYCLOAK_REALM}/protocol/openid-connect/logout?post_logout_redirect_uri=${encodeURIComponent(redirectUrl)}`;
  res.redirect(path);
}