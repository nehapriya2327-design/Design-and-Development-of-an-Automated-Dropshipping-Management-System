"use client";
import { request } from "@/lib/api/handler";
import { useParams, useRouter } from "next/navigation";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

type EbayFeedback = {
  id: number;
  feedbackUser: string;
  commentText: string;
  commentType: string;
  createdAt: Date;
};

type OrderItem = {
  EbayFeedback: EbayFeedback[];
};

type Variant = {
  id: number;
  formattedShopifyId: string;
  title: string;
  sku: string;
  price: number;
  imageUrl: string;
  imageAlt: string;
  listedOnEbay: boolean;
  inventory: number;
  product: {
    title: string;
  };
  OrderItem: OrderItem[];
};

const Page = () => {
  const [variant, setVariant] = useState<Variant>();
  const [selectedFilter, setSelectedFilter] = useState<
    "All" | "Positive" | "Neutral" | "Negative"
  >("All");
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const fetchVariant = async (id: string) => {
    try {
      const response: { variant: Variant } = await request({
        method: "GET",
        url: `/products/getVariantById?id=${id}`,
      });

      if (response?.variant) {
        setVariant(response.variant);
      }
    } catch (error) {
      console.log("Error in Fetching Variant Details", error);
    }
  };
  useEffect(() => {
    if (id) fetchVariant(id);
  }, [id]);

  const feedbacks =
    variant?.OrderItem.flatMap((item: OrderItem) => item?.EbayFeedback) || [];

  const filteredFeedback = feedbacks.filter((fb) =>
    selectedFilter === "All" ? true : fb.commentType === selectedFilter
  );

  return (
    <div>
      <motion.div
        className="max-w-5xl mx-auto p-6 bg-white shadow-xl rounded-lg mt-10"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-3xl font-bold mb-6 text-gray-800">
          Variant Details
        </h1>

        {variant ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="w-full h-64 relative border rounded-md overflow-hidden">
              <Image
                src={variant.imageUrl || "/placeholder.png"}
                alt={variant.title}
                fill
                className="object-contain"
              />
            </div>

            <div className="space-y-4 text-gray-700 text-base">
              <div>
                <strong className="block text-gray-600">Title:</strong>
                {variant.title}
              </div>
              <div>
                <strong className="block text-gray-600">SKU:</strong>
                {variant.sku}
              </div>
              <div>
                <strong className="block text-gray-600">Price:</strong> $
                {variant.price.toFixed(2)}
              </div>
              <div>
                <strong className="block text-gray-600">Inventory:</strong>{" "}
                {variant.inventory}
              </div>
              <div>
                <strong className="block text-gray-600">Product:</strong>{" "}
                {variant.product.title}
              </div>
              <div>
                <strong className="block text-gray-600">Listed on eBay:</strong>{" "}
                {variant.listedOnEbay ? "Yes" : "No"}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">Loading variant data...</p>
        )}

        {/* Feedback Section */}
      </motion.div>
      <motion.div
        className="max-w-5xl mx-auto p-6 bg-white shadow-xl rounded-lg mt-10"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="mt-3">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">
            Feedback({filteredFeedback.length})
          </h2>
          <div className="flex gap-3 mb-6">
            {["All", "Positive", "Neutral", "Negative"].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedFilter(type as typeof selectedFilter)}
                className={`px-4 py-1 rounded border font-medium text-sm transition ${
                  selectedFilter === type
                    ? "bg-blue-600 text-white border-blue-600"
                    : "bg-white text-gray-600 border-gray-300 hover:bg-gray-100"
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          {filteredFeedback.length > 0 ? (
            <motion.div
              className="grid grid-cols-1 gap-6"
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.1 } },
              }}
            >
              {filteredFeedback.map((fb) => (
                <motion.div
                  key={fb.id}
                  className="p-3 bg-gray-50 border rounded-lg shadow-sm"
                  variants={{
                    hidden: { opacity: 0, y: 10 },
                    visible: { opacity: 1, y: 0 },
                  }}
                >
                  <div className="flex justify-between items-center mb-2">
                    <div className="font-semibold text-gray-800">
                      {fb.feedbackUser}
                    </div>
                    <span
                      className={`text-sm font-medium px-2 py-1 rounded ${
                        fb.commentType === "Positive"
                          ? "bg-green-100 text-green-700"
                          : fb.commentType === "Neutral"
                          ? "bg-yellow-100 text-yellow-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {fb.commentType}
                    </span>
                  </div>
                  <div className="text-gray-600">{fb.commentText}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {new Date(fb.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </div>
                </motion.div>
              ))}
              <div className="mt-4">
                <button
                  onClick={() => router.push(`/feedback`)}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded shadow"
                >
                  View All Feedback
                </button>
              </div>
            </motion.div>
          ) : (
            <p className="text-gray-500">No feedback available.</p>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Page;
