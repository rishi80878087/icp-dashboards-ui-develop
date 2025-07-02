// Import necessary dependencies
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import getConfig from 'next/config';
import { Spinner } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { useSession } from "next-auth/react"
import StorageService from '../../services/storageService';

const { publicRuntimeConfig } = getConfig();
const { KEYCLOAK_ENABLED } = publicRuntimeConfig;

function Public({ children }) {
  const { data: session, status } = useSession();
  const isSessionExpired = !!session?.error;
  const router = useRouter();
  const isLoading = status === 'loading'
  const isAuthenticated =
    KEYCLOAK_ENABLED === 'true'
      ? status === 'authenticated'
      : Boolean(StorageService.get('authorization')?.access_token);
  const isInitialized = true; // Assume Keycloak initialization is not required

  useEffect(() => {
    if (((isAuthenticated && !isSessionExpired) && !isLoading) && isInitialized) {
      router.push('/');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isInitialized, isLoading]);

  if ((isAuthenticated && !isSessionExpired) || isLoading) {
    return (
      <div className="w-100 h-100 d-flex justify-content-center align-items-center">
        <Spinner />
      </div>
    );
  }

  return <>{children}</>;
}

Public.propTypes = {
  children: PropTypes.element.isRequired,
};

export default Public;
