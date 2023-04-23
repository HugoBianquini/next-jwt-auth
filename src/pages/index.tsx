import { FormEvent, useContext, useReducer, useState } from 'react'
import styles from '../styles/Home.module.css'
import { AuthContext } from '../contexts/AuthContext';
import { GetServerSideProps } from 'next';
import { parseCookies } from 'nookies';

export default function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const { signIn } = useContext(AuthContext)

  function handleSubmit(event: FormEvent) {

    event.preventDefault();

    const data = {
      email,
      password
    }

    signIn(data);
  }

  return (
      <form onSubmit={handleSubmit} className={styles.container}>
        <input type='email' value={email} onChange={e => setEmail(e.target.value)} />
        <input type='password' value={password} onChange={e => setPassword(e.target.value)} />
        <button type='submit'>Entrar</button>
      </form>
  )
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const cookies = parseCookies(ctx);

  // if user is already logged
  if(cookies['nextjwt.token']) {
    return {
      redirect: {
        destination: '/dashboard',
        permanent: false
      }
    }
  }

  return {
    props: {}
  }
}
