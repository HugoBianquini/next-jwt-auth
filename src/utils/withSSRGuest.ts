import { GetServerSideProps, GetServerSidePropsContext, GetServerSidePropsResult } from "next";
import { parseCookies } from "nookies";

export function withSSRGuest(fn: GetServerSideProps) {
  return async (ctx: GetServerSidePropsContext): Promise<GetServerSidePropsResult<{}>> => {
    const cookies = parseCookies(ctx);
    console.log(ctx)

    // if user is already logged
    if(cookies['nextjwt.token']) {
      return {
        redirect: {
          destination: '/dashboard',
          permanent: false
        }
      }
    }

    return await fn(ctx)
  }
}