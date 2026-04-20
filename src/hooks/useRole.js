import useAuth from './useAuth';

const useRole = () => {
  const { role } = useAuth();
  return role;
};

export default useRole;