import NextAuth from "next-next";
import CredentialsProvider from "next-auth/providers/credentials";
import { authConfig } from "./authconfig";
const login = async (CredentialsProvider) => {
    

}
export const {signIn, signOut, auth} = NextAuth({
    ...authConfig,
    providers: [
        CredentialsProvider({
            async authorize(credentials) {
try{
    const user = await login(credentials);
    return user;
}catch(err){
    console.log("Login error:", err);
    return null;
                
            }}})
    ]
})