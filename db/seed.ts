import { db } from "./index";
import { users, documents } from "@shared/schema";
import { hashPassword } from "../server/services/authService";
import { eq } from "drizzle-orm";

async function seed() {
  try {
    // Check if admin user already exists
    const existing = await db.query.users.findFirst({
      where: (users) => eq(users.email, "admin@example.com"),
    });

    if (existing) {
      console.log("Seed data already exists. Skipping.");
      return;
    }

    const password = await hashPassword("adminpass");
    const [admin] = await db
      .insert(users)
      .values({
        username: "admin",
        email: "admin@example.com",
        password,
        role: "admin",
        emailVerified: true,
      })
      .returning();

    await db.insert(documents).values({
      userId: admin.id,
      title: "Welcome",
      inputContent: "Welcome to AI LaTeX Generator!",
      latexContent: "Welcome to AI LaTeX Generator!",
      documentType: "basic",
      compilationSuccessful: true,
    });

    console.log("Database seeded successfully");
  } catch (error) {
    console.error("Seed error:", error);
  } finally {
    process.exit(0);
  }
}

seed();
