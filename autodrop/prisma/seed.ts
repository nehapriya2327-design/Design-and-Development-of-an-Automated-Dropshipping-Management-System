import { hashPassword } from "@/lib/hash";
import { PrismaClient, Role } from "@prisma/client";

const prisma = new PrismaClient();

const hashedPassword = hashPassword('Suretek@123');

const userData = [
    {
        name: "Mukund",
        email: "autodrop@suretek.com",
        password: hashedPassword,
        role: Role.SUPERADMIN,
    },
];

export async function main() {
    for (const u of userData) {
        await prisma.user.create({ data: u });
    }
}

main();