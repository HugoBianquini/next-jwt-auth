import { AuthTokenError } from "@/services/errors/AuthTokenError";
import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { parseCookies } from "nookies";
import decode from 'jwt-decode'
import { validateUserPermissions } from "./validateUserPermissions";

type WithSSRAuthOptions = {
  permissions?: string[];
  roles?: string[];
}

export function withSSRAuth(fn: GetServerSideProps, options?: WithSSRAuthOptions) {
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<{}>> => {
    const cookies = parseCookies(ctx);
    const token = cookies['nextjwt.token']

    // if user is not authenticated
    if(!token) {
      return {
        redirect: {
          destination: '/',
          permanent: false
        }
      }
    }

    if(options) {
      const user = decode<{permissions: string[], roles: string[]}>(token);
      const {permissions, roles} = options
  
      const userHasValidPermissions = validateUserPermissions({
        user,
        permissions,
        roles
      })

      if(!userHasValidPermissions) {
        return {
          redirect: {
            destination: '/dashboard',
            permanent: false
          }
        }
      }
    }

    try {
      return await fn(ctx)
    } catch (err) {
      // if an auth error occurs, redirect to login
      if(err instanceof AuthTokenError) {
        return {
          redirect: {
            destination: '/',
            permanent: false
          }
        }
      } else {
        // handle any other error
        return {
          props: {}
        }
      }
    }
  }
}