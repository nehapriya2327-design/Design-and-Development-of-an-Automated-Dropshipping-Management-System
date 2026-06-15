import prisma from "@/lib/prisma";
import { handlerWrapper } from "@/lib/server/handler";
import { success } from "@/lib/server/response";

export const GET = handlerWrapper(async () => {
    const categories = await prisma.ebayCategory.findMany({
        orderBy: { name: "asc" },
    });

    return success(categories);
});
