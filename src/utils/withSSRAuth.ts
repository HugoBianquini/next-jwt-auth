import { AuthTokenError } from "@/services/errors/AuthTokenError";
import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { parseCookies } from "nookies";

export function withSSRAuth(fn: GetServerSideProps) {
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<{}>> => {
    const cookies = parseCookies(ctx);

    // if user is not authenticated
    if(!cookies['nextjwt.token']) {
      return {
        redirect: {
          destination: '/',
          permanent: false
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