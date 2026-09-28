"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import {
  createSessionForUser,
  destroyCurrentSession,
} from "@/lib/auth";

export async function login(formData: FormData) {
  const email = formData.get("email");
  const password = formData.get("password");

  if (typeof email !== "string" || typeof password !== "string" || !email || !password) {
    redirect("/login?error=invalid");
  }

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    redirect("/login?error=invalid");
  }

  const passwordMatches = await bcrypt.compare(password, user.passwordHash);

  if (!passwordMatches) {
    redirect("/login?error=invalid");
  }

  await createSessionForUser(user.id);

  redirect("/dashboard");
}

export async function logout() {
  await destroyCurrentSession();

  redirect("/login");
}