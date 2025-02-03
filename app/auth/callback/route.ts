import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user || !user.id || !user.email) {
      console.error("No user data available in callback");
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Check if user exists in database
    const existingUser = await prisma.user.findUnique({
      where: {
        id: user.id,
      },
    });

    console.log("existingUser", existingUser);
    console.log("user", user);

    if (!existingUser) {
      console.log("Creating new user:", user.id, user.email);
      // Create new user in database
      await prisma.user.create({
        data: {
          id: user.id,
          email: user.email,
        },
      });
    }

    // Get the intended destination from the URL parameters
    const searchParams = new URL(request.url).searchParams;
    const destination = searchParams.get("destination") || "/pokerrooms";

    return NextResponse.redirect(new URL(destination, request.url));
  } catch (error) {
    console.error("Error in auth callback:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}
