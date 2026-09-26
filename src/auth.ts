import NextAuth from "next-auth";
import type { Provider } from "next-auth/providers";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword } from "@/lib/password";
import { ensureDefaultPipelines } from "@/lib/seed";
// import { Resend } from "resend";

// const resend = new Resend(process.env.RESEND_API_KEY);

async function sendWelcomeEmail(name: string, email: string) {
  // Resend email di-disable sementara sesuai permintaan.
  console.log("[EMAIL DISABLED] Welcome email untuk:", email);
}

const providers: Provider[] = [
  Credentials({
    id: "credentials",
    name: "Email & Password",
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const email = String(credentials?.email ?? "")
        .trim()
        .toLowerCase();
      const password = String(credentials?.password ?? "");
      if (!email || !password) return null;

      const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);
      if (!user || !user.passwordHash) return null;

      const valid = await verifyPassword(password, user.passwordHash);
      if (!valid) return null;

      return { id: user.id, name: user.name, email: user.email, image: user.image ?? undefined };
    },
  }),
];

// Only enable OAuth providers when their credentials are actually configured,
// so the app remains fully functional in environments without OAuth secrets.
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  providers.push(
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  );
}

if (process.env.GITHUB_ID && process.env.GITHUB_SECRET) {
  providers.push(
    GitHub({
      clientId: process.env.GITHUB_ID,
      clientSecret: process.env.GITHUB_SECRET,
    }),
  );
}

export const OAUTH_PROVIDERS_ENABLED = {
  google: Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
  github: Boolean(process.env.GITHUB_ID && process.env.GITHUB_SECRET),
};

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers,
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" || account?.provider === "github") {
        const email = user.email?.toLowerCase();
        if (!email) return false;

        const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
        let internalId = existing?.id;

        if (!existing) {
          const [created] = await db
            .insert(users)
            .values({
              name: user.name ?? email.split("@")[0],
              email,
              image: user.image,
            })
            .returning({ id: users.id });
          internalId = created.id;
          
          // Kirim email selamat datang untuk pendaftar baru
          // Sengaja tidak di-await agar proses login tidak terhambat loading email
          sendWelcomeEmail(user.name ?? email.split("@")[0], email).catch(console.error);
        }

        if (internalId) {
          await ensureDefaultPipelines(internalId);
          user.id = internalId;
        }
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user?.id) {
        token.userId = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.userId) {
        session.user.id = token.userId as string;
      }
      return session;
    },
  },
});
