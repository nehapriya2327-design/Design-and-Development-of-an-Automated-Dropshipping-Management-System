import prisma from "@/lib/prisma";
import { handlerWrapper } from "@/lib/server/handler";
import { success } from "@/lib/server/response";
import { NextRequest } from "next/server";

type ebayData = {
    categoryId: string;
    categoryName: string;
}

type body = {
    productId: string;
    categoryId: string;
    data: ebayData[];
}

// GET API to fetch AI suggestions based on productId or categoryId
export const GET = handlerWrapper(async (req: NextRequest) => {
    const { searchParams } = req.nextUrl;
    const productId = searchParams.get("productId");
    const categoryId = searchParams.get("categoryId");
    if (!productId && !categoryId) {
        return success({ result: 'Error' }, "Provide Product or Category ID", 400);
    }

    // Suggestion fetching using productId
    if (productId) {
        // Filter AI suggestions by product ID
        const suggestions = await prisma.aISuggestion.findMany({
            where: {
                productId: parseInt(productId),
            }
        })

        if (suggestions.length === 0) {
            return success({ result: 'Error' }, "No AI suggestions found for the given product ID");
        }

        return success(suggestions, "AI suggestions fetched successfully");
    }

    // Suggestion fetching using categoryId
    if (categoryId) {
        // Filter AI suggestions by category ID
        const suggestions = await prisma.aISuggestion.findMany({
            where: {
                ebayCategoryId: parseInt(categoryId),
            }
        })

        if (suggestions.length === 0) {
            return success({ result: 'Error' }, "No AI suggestions found for the given category ID");
        }

        return success(suggestions, "AI suggestions fetched successfully");
    }

    return success("test")
})

// POST API to create a new AI suggestion based on ebay return data
export const POST = handlerWrapper(async (req: NextRequest) => {
    const { productId, data }: body = await req.json();

    if (!productId || !data || data.length === 0) {
        return success({ result: 'Error' }, "Product ID, Category ID and data are required");
    }

    // Create a new AI suggestion based on the provided data

    for (const Item of data) {
        await prisma.aISuggestion.create({
            data: {
                productId: parseInt(productId),
                // ebayCategoryId: parseInt(categoryId),
                suggestedId: Item.categoryId,
                suggestedName: Item.categoryName,
                confidenceScore: data.findIndex(i => i.categoryId === Item.categoryId) + 1, // Assuming confidence score is based on index for simplicity
            }
        });
    }

    // Sopposing it will be created successfully
    const suggestions = await prisma.aISuggestion.findMany({
        where: {
            productId: parseInt(productId)
        }
    });

    return success(suggestions, "AI suggestion created successfully");
});

type UpdateBody = {
    id: number;
    suggestedId: string;
    suggestedName: string;
}
// PUT API to update an existing AI suggestion - need to work on this
export const PUT = handlerWrapper(async (req: NextRequest) => {
    const { id, suggestedId, suggestedName }: UpdateBody = await req.json();
    // Implementation for updating an AI suggestion
    const updatedSuggestion = await prisma.aISuggestion.update({
        where: { id },
        data: {
            suggestedId,
            suggestedName,
        }
    })

    if (!updatedSuggestion) {
        return success({ result: 'Error' }, "Failed to update AI suggestion");
    }

    return success(updatedSuggestion, "AI suggestion updated successfully");

})

// DELETE API to delete an AI suggestion
export const DELETE = handlerWrapper(async (req: NextRequest) => {
    const { searchParams } = req.nextUrl;
    // const id = searchParams.get("id");
    // if (!id) {
    //     return success({ result: 'Error' }, "ID is required to delete an AI suggestion");
    // }
    const productId = searchParams.get("productId");

    if (!productId) {
        return success({ result: 'Error' }, "productId is required to delete an AI suggestion");
    }

    // Implementation for deleting an AI suggestion
    const deletedSuggestion = await prisma.aISuggestion.deleteMany({
        where: {
            // id: parseInt(id),
            productId: parseInt(productId)
        }
    });

    if (!deletedSuggestion) {
        return success({ result: 'Error' }, "Failed to delete AI suggestion");
    }

    return success(deletedSuggestion, "AI suggestion deleted successfully");
});