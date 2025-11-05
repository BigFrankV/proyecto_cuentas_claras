import { useRouter } from 'next/router';
import { useEffect } from 'react';

export default function Login() {
  const router = useRouter();

  useEffect(() => {
    // Redirige al index que ahora es la página de login
    router.replace('/');
  }, [router]);

  return (
    <div className='d-flex justify-content-center align-items-center min-vh-100'>
      <div className='spinner-border text-primary' role='status'>
        <span className='visually-hidden'>Cargando...</span>
      </div>
    </div>
  );
}

