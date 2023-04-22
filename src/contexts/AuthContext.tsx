import { api } from "@/services/api";
import Router from "next/router";
import { destroyCookie, parseCookies, setCookie } from "nookies";
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
      .catch(() => {
        signOut();
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

      Router.push('/dashboard')
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

export function setTokenCookies(token: string, refreshToken: string, ctx = undefined) {
      // first param is undefined because signIn() is executed on browser
      // TODO: change the cookie name
      setCookie(ctx, 'nextjwt.token', token, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      })

      setCookie(ctx, 'nextjwt.refreshToken', refreshToken, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        path: '/'
      })
}

export function signOut(ctx = undefined){
  destroyCookie(ctx, 'nextjwt.token');
  destroyCookie(ctx, 'nextjwt.refreshToken')

  Router.push("/")
}