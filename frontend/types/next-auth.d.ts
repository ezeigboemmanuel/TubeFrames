import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      isPro: boolean
    } & DefaultSession["user"]
  }

  interface User {
    isPro: boolean
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string
    isPro: boolean
  }
}