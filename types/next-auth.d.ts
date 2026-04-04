import "next-auth";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: "student" | "admin";
      className: string | null;
      department: string | null;
      isBoarder: boolean;
      profileImageUrl: string | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    className: string | null;
    department: string | null;
    isBoarder: boolean;
    profileImageUrl: string | null;
  }
}
