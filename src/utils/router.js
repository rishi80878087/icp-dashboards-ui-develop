import { useEffect } from 'react';
import { useRouter } from 'next/router';


let router = null

function Router() {
  const _router = useRouter();

  useEffect(() => {
    router = _router;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}

const getRouter = () => router;
export default getRouter;
export { Router };
