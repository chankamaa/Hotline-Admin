import { sign } from "crypto";

export const authConfig = {
    page: {
        signIn: "/login",
    },
    callbacks: {
        authorized: ({ req, request }) => {
            const isLoggedIn = auth?.user
            const isOnDashboard = request.nextUrl.pathname.startsWith("/dashboard")
            if (isOnDashboard ){
                if (isLoggedIn) return true
                return false
            }else if(isLoggedIn){
                return Response.redirect(new URL("/dashboard", request.url))
            }  
            return true
         }
        }
    }