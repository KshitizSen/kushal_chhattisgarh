import { useEffect } from 'react';
import useAuthStore from '../store/authStore';

export const useAuth = () => {
  const { initialize, ...authState } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return authState;
};

export default useAuth;
