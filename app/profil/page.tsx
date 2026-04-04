import AppShell from "../shell/AppShell";
import ProfileScreen from "../screens/ProfileScreen";
import { getServerSession } from "next-auth";
import { authOptions } from "../lib/auth";
import { redirect } from "next/navigation";
import { db } from "../lib/db";
import { users } from "../lib/schema";
import { eq } from "drizzle-orm";

export default async function ProfilPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    redirect("/giris");
  }

  // Use the ID from session to get the full profile from DB
  const [dbUser] = await db.select().from(users).where(eq(users.id, session.user.id));

  return (
    <AppShell>
      <ProfileScreen dbUser={dbUser} />
    </AppShell>
  );
}
