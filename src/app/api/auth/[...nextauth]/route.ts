import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import prisma from "@/lib/prisma"
import bcrypt from "bcryptjs"

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "Correo Electrónico",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "tu@email.com" },
        password: { label: "Contraseña", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Datos incompletos");
        }

        if (!process.env.DATABASE_URL) {
          throw new Error("ERROR CRÍTICO: DATABASE_URL no existe en Vercel Config");
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: { company: true }
          });

          if (!user || !user.password) {
            throw new Error("Usuario no encontrado o usa otro método de acceso");
          }

          const passwordsMatch = await bcrypt.compare(credentials.password, user.password);

          if (!passwordsMatch) {
            throw new Error("Contraseña incorrecta");
          }

          return user;
        } catch (error: any) {
          console.error("NextAuth authorize exception:", error);
          throw new Error(error?.message || "Error interno de base de datos o conexión (504/401)");
        }
      }
    })
  ],
  session: {
    strategy: "jwt" as "jwt",
  },
  callbacks: {
    async jwt({ token, user, trigger, session }: any) {
      if (user) {
        token.id = user.id;
        token.subscriptionTier = user.subscriptionTier;
        token.role = user.role;
        token.createdAt = user.createdAt;
        token.mustChangePassword = user.mustChangePassword;
        token.companyName = typeof user.company === 'object' && user.company !== null ? user.company.name : null;
        // token.companyLogo eliminado porque excede el límite de 4KB de la cookie JWT
      }
      
      // Update session handling
      if (trigger === "update" && session && session.mustChangePassword !== undefined) {
        token.mustChangePassword = session.mustChangePassword;
      }
      
      return token;
    },
    async session({ session, token }: any) {
      if (session?.user) {
        session.user.id = token.id;
        session.user.subscriptionTier = token.subscriptionTier;
        session.user.role = token.role;
        session.user.createdAt = token.createdAt;
        session.user.mustChangePassword = token.mustChangePassword;
        session.user.companyName = token.companyName;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
  },
  trustHost: true,
  secret: (process.env.NEXTAUTH_SECRET || "miperai_secret_fallback_temporal_123_edge").trim(),
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
