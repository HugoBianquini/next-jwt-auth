import { Can } from '@/components/Can';
import { AuthContext } from '@/contexts/AuthContext';
import { setupApiClient } from '@/services/api';
import { api } from '@/services/apiClient';
import { withSSRAuth } from '@/utils/withSSRAuth';
import { useContext, useEffect } from 'react';

export default function Dashboard() {
  const { user, signOut } = useContext(AuthContext);

  useEffect(() => {
    api
      .get('/me')
      .then((response) => console.log(response))
      .catch((err) => console.log(err));
  }, []);

  return (
    <>
      <h1>Dashboard: {user?.email}</h1>

      <button type="button" onClick={signOut}>
        Sign Out
      </button>

      <Can permissions={['metrics.list']}>
        <div>Métricas</div>
      </Can>
    </>
  );
}

export const getServerSideProps = withSSRAuth(async (ctx) => {
  const apiClient = setupApiClient(ctx);
  const response = await apiClient.get('/me');

  console.log(response.data);

  return {
    props: {},
  };
});
