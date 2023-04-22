import { api } from "@/services/api";
import { useRouter } from "next/router";
import { setCookie } from "nookies";
import { createContext, ReactNode, useState } from "react";

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
  const router = useRouter()

  const isAuthenticated = !!user;

  async function signIn({email, password}: SignInCredentials) {
    
    try {
      const response = await api.post('sessions', {
        email,
        password
      })

      const {token, refreshToken, permissions, roles} = response.data;

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
  
      setUser({
        email,
        permissions,
        roles
      });

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