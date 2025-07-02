## Service Architecture:
Next

## Prerequisite:
Node version: 18.18.1

## Run locally:

Proxy urls to be updated: next.config.js

* **const devUrl = [url];**

`yarn run dev`

## Build Steps:
docker file

## Healthcheck:

1.  Endpoint: `/` 

## Ports Used:
* **3000**
if already occupied already, automatically takes next avail port

## Environment Variables
* **CACHE_ENABLED=[true/false]**
* **BASE_URL=[url]**
* **APP_LOGO=[base 64 image]**
* **APP_LOGO_DARK=[base 64 image]**
* **APPLICATION_NAME_ENGLISH=[string]**
* **APPLICATION_NAME_ARABIC=[string]**
* **FAVICON=[base 64 image]**

* **KEYCLOAK_ENABLED=[true/false]**
// In case Keycloak is enabled
## Mandatory Environment Variables 
* **KEYCLOAK_URL=[url]**
* **KEYCLOAK_REALM=[realm_name]**
* **KEYCLOAK_CLIENT_ID=[cliend-id]**
* **KEYCLOAK_SECRET=[keycloak-secret]**
* **NEXTAUTH_URL=[after_login_redirect_url]**

## Contacts:
1. Service Owner: **Ravi Kharbanda**
2. Email: **ravi@saal.ai**
