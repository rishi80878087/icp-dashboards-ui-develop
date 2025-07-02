import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()

const {
  KEYCLOAK_URL,
  KEYCLOAK_REALM,
  KEYCLOAK_CLIENT_ID
} = publicRuntimeConfig;

const keycloakConfig = {
  url: KEYCLOAK_URL,
  realm: KEYCLOAK_REALM,
  clientId: KEYCLOAK_CLIENT_ID,
};

const getKeycloakConfig = () => {
  return keycloakConfig;
  // return new Keycloak(keycloakConfig)
};
export default getKeycloakConfig;
