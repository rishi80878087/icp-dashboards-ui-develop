import NextAuth from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import getConfig from 'next/config'

const { serverRuntimeConfig } = getConfig()

function parseJwt (token) {
  const parsedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
  return parsedToken;
}

const {
  KEYCLOAK_URL,
  KEYCLOAK_REALM,
  KEYCLOAK_CLIENT_ID,
  KEYCLOAK_SECRET,
  NEXTAUTH_URL,
  BASE_URL
} = serverRuntimeConfig;

const refreshAccessToken = async (token) => {
  try {
    const details = {
      client_id: KEYCLOAK_CLIENT_ID,
      client_secret: KEYCLOAK_SECRET,
      grant_type: 'refresh_token',
      refresh_token: token.refresh_token,
    };
    const formBody = [];
    Object.entries(details).forEach(([key, value]) => {
      const encodedKey = encodeURIComponent(key);
      const encodedValue = encodeURIComponent(value);
      formBody.push(encodedKey + '=' + encodedValue);
    });
    const formData = formBody.join('&');
    const url = `${KEYCLOAK_URL}realms/${KEYCLOAK_REALM}/protocol/openid-connect/token`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      },
      body: formData,
    });
    const refreshedTokens = await response.json();
    if (!response.ok) throw refreshedTokens;
    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      expires_at: (Math.floor(Date.now() / 1000 + refreshedTokens.expires_in) - 60),
      refresh_token: refreshedTokens.refresh_token,
    };
  } catch (error) {
    return {
      ...token,
      error: 'RefreshAccessTokenError',
    };
  }
};

export const authOptions = {
  // Configure one or more authentication providers
  site: `${NEXTAUTH_URL}${BASE_URL}/api/auth`,
  providers: [
    KeycloakProvider({
      clientId: KEYCLOAK_CLIENT_ID,
      clientSecret: KEYCLOAK_SECRET,
      issuer: `${KEYCLOAK_URL}realms/${KEYCLOAK_REALM}`,
    })
    // ...add more providers here
  ],
  pages: {
    signIn: `/login`,
  },
  session: {
    jwt: true,
  },
  jwt: {
    secret: 'secret_jwt',
  },
  // debug: true,
  callbacks: {
    async session({ session, token }) {
      const { refresh_token, ...restToken } = token;
      return {
        ...session,
        ...restToken,
        tokenParsed: parseJwt(token.accessToken)
      };
    },
    async jwt({ token, user, account }) {
      if (account && user) {
        // Add access_token, refresh_token and expirations to the token right after signin
        return {
          accessToken: account.access_token,
          expires_at: (Math.floor(Date.now() / 1000 + account.expires_in) - 60),
          refresh_token: account.refresh_token,
          // idToken: account.id_token,
          // user
        }
      } else if (Date.now() < (token.expires_at * 1000)) {
        // If the access token has not expired yet, return it
        return token
      }
        
      return Promise.resolve(refreshAccessToken(token));
    },
  },
}
export default NextAuth(authOptions)