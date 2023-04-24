import { setupApiClient } from "@/services/api";
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

    return await fn(ctx)
  }
}