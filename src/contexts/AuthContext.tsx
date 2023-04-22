import { api } from "@/services/api";
import { useRouter } from "next/router";
import { parseCookies, setCookie } from "nookies";
import { createContext, ReactNode, useEffect, useState } from "react";

type User = {
  email: string;
  permissions: string[];
  roles: string[];
}

type SignInCredentials = {
  email: string;
  password: string;
}

type AuthContextData = {
  signIn(credentials: SignInCredentials): Promise<void>;
  user: User | undefined;
  isAuthenticated: boolean;
}

type AuthProviderProps = {
  children: ReactNode;
}

export const AuthContext = createContext({} as AuthContextData)


export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User>()
  const router = useRouter();

  useEffect(() => {
    const {'nextjwt.token': token} = parseCookies();

    if(token) {
      api.get("/me").then(response => {
        const {email, permissions, roles} = response.data;

        setUser({
          email,
          permissions,
          roles
        })
      })
    }
  }, [])

  const isAuthenticated = !!user;

  async function signIn({email, password}: SignInCredentials) {
    
    try {
      const response = await api.post('sessions', {
        email,
        password
      })

      const {token, refreshToken, permissions, roles} = response.data;

      setTokenCookies(token, refreshToken);
  
      setUser({
        email,
        permissions,
        roles
      });

      api.defaults.headers['Authorization'] = `Bearer ${token}`

      router.push('/dashboard')
    } catch(err) {
      console.log(err)
    }
  }

  return (
    <AuthContext.Provider value={{signIn, isAuthenticated, user}}>
      {children}
    </AuthContext.Provider>
  )

}

export function setTokenCookies(token: string, refreshToken: string) {
      // first param is undefined because signIn() is executed on browser
      // TODO: change the cookie name
      setCookie(undefined, 'nextjwt.token', token, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      })

      setCookie(undefined, 'nextjwt.refreshToken', refreshToken, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      })
}