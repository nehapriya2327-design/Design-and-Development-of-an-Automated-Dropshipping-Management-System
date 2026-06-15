"use client";
import { request } from "@/lib/api/handler";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import country from "../../../utils/countries_states.json";
import { formatDistanceToNow } from "date-fns";
import { X } from "lucide-react";
// import { X } from "lucide-react";

type FeedbackItem = {
  id: number;
  feedbackId: string;
  feedbackUser: string;
  commentText: string;
  feedbackResponse: string;
  commentType: "Positive" | "Neutral" | "Negative";
  createdAt: string;
  orderItemId: string;
  orderItem: OrderItem;
};

type OrderItem = {
  variant: FeedbackVariant;
  ebayOrder: EbayOrder;
};

type ShippingAddress = {
  state: string;
  country: string;
};

type EbayOrder = {
  shippingAddress: ShippingAddress;
};

type FeedbackVariant = {
  variantId: number;
  title: string;
  imageUrl: string;
  price: number;
  productId: number;
  formattedShopifyId: string;

  // feedbacks: FeedbackItem[];
};

// interface CountryOptions {
//   value: string;
//   label: string;
//   state: { value: string; label: string }[];
//   iso2: string;
//   iso3: string;
// }

const Pages = () => {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [filterType, setFilterType] = useState<
    "All" | "Positive" | "Neutral" | "Negative"
  >("All");
  const [dateFilter, setDateFilter] = useState<
    "All" | "1M" | "3M" | "6M" | "Custom"
  >("All");
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
  const router = useRouter();
  const [selectedState, setSelectedState] = useState("All");
  const [selectedCountry, setSelectedCountry] = useState("All");
  const [replyingTo, setReplyingTo] = useState<FeedbackItem | null>(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [loadingReply, setLoadingReply] = useState(false);
  const countryOptions = country?.data;
  const fetchFeedback = async () => {
    try {
      const response: { data: FeedbackItem[] } = await request({
        url: "/ebay/feedback/all",
        method: "GET",
      });

      setFeedback(response.data);
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    fetchFeedback();
  }, []);

  const getDateFilterRange = () => {
    const today = new Date();
    switch (dateFilter) {
      case "1M":
        return new Date(today.setMonth(today.getMonth() - 1));
      case "3M":
        return new Date(today.setMonth(today.getMonth() - 3));
      case "6M":
        return new Date(today.setMonth(today.getMonth() - 6));
      default:
        return null;
    }
  };

  // const toggleAccordion = (id: string) => {
  //   setExpandedIndex((prev) => (prev === id ? null : id));
  // };

  // const onClick = (id: string) => {
  //   router.push(`/products/${id}`);
  // };
  const filteredFeedbacks = feedback.filter((fb) => {
    const matchesType = filterType === "All" || fb.commentType === filterType;
    const matchesSearch =
      fb.commentText.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fb.feedbackUser.toLowerCase().includes(searchTerm.toLowerCase());
    const feedbackDate = new Date(fb.createdAt);
    let matchesDate = true;
    if (dateFilter !== "All") {
      if (dateFilter === "Custom" && customStartDate && customEndDate) {
        matchesDate =
          feedbackDate >= customStartDate && feedbackDate <= customEndDate;
      } else {
        const filterStartDate = getDateFilterRange();
        matchesDate = filterStartDate ? feedbackDate >= filterStartDate : true;
      }
    }
    const matchesCountry =
      selectedCountry === "All" ||
      fb.orderItem.ebayOrder.shippingAddress.country === selectedCountry;
    const matchesState =
      selectedState === "All" ||
      fb.orderItem.ebayOrder.shippingAddress.state === selectedState;

    return (
      matchesType &&
      matchesSearch &&
      matchesDate &&
      matchesCountry &&
      matchesState
    );
  });

  const selectedCountryData = countryOptions.find(
    (c) => c.iso2 === selectedCountry
  );

  const handleSendReply = async () => {
    if (!replyMessage.trim() || !replyingTo) return;
    try {
      setLoadingReply(true);
      await request({
        url: "/ebay/feedback/reply", // Replace with your actual API endpoint
        method: "POST",
        data: {
          feedbackId: replyingTo.feedbackId,
          commentText: replyMessage.trim(),
          targetUserId: replyingTo.feedbackUser,
        },
      });
      // toast.success("Message sent to buyer!");
      setReplyingTo(null);
      setReplyMessage("");
      fetchFeedback();
    } catch (err) {
      console.log(err);
      // toast.error("Failed to send message");
    } finally {
      setLoadingReply(false);
    }
  };

  return (
    <motion.div
      className="max-w-7xl dark:bg-gray-700 mx-auto my-8  px-6 bg-white rounded py-10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <h1 className="text-3xl dark:text-white font-bold mb-6 text-gray-800">
        All Feedbacks({filteredFeedbacks.length})
      </h1>

      {/* Search & Filter */}
      {/* <div className="flex flex-col md:flex-row md:items-center gap-4 mb-6">
        <Input
          placeholder="Search by comment or user..."
          className="w-full md:w-1/2"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          value={filterType}
          onChange={(e) =>
            setFilterType(
              e.target.value as "All" | "Positive" | "Neutral" | "Negative"
            )
          }
          className="w-full md:w-1/6 border border-gray-300 rounded px-3 py-2 text-gray-700"
        >
          <option value="All">All Types</option>
          <option value="Positive">Positive</option>
          <option value="Neutral">Neutral</option>
          <option value="Negative">Negative</option>
        </select>
        <select
          value={selectedCountry}
          onChange={(e) => {
            setSelectedCountry(e.target.value);
            setSelectedState("All");
          }}
          className="border border-gray-300 rounded px-3 py-2 text-gray-700"
        >
          <option value="All">All Countries</option>
          {country.data.map((c) => (
            <option key={c.value} value={c.iso2}>
              {c.label}
            </option>
          ))}
        </select>

        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          className="border border-gray-300 rounded px-3 py-2 text-gray-700"
        >
          <option value="All">All States</option>
          {selectedCountryData?.states?.map((state) => (
            <option key={state.value} value={state.value}>
              {state.label}
            </option>
          ))}
        </select>

        <select
          value={dateFilter}
          onChange={(e) =>
            setDateFilter(
              e.target.value as "All" | "1M" | "3M" | "6M" | "Custom"
            )
          }
          className="border border-gray-300 rounded px-3 py-2 text-gray-700"
        >
          <option value="All">All Dates</option>
          <option value="1M">Last 1 Month</option>
          <option value="3M">Last 3 Months</option>
          <option value="6M">Last 6 Months</option>
          <option value="Custom">Custom Range</option>
        </select>

        {dateFilter === "Custom" && (
          <div className="flex gap-4 flex-wrap mb-6">
            <div>
              <label className="block text-sm font-medium text-gray-600">
                Start Date
              </label>
              <DatePicker
                selected={customStartDate}
                onChange={(date) => setCustomStartDate(date)}
                className="border border-gray-300 rounded px-3 py-2"
                maxDate={new Date()}
                placeholderText="Select start date"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-600">
                End Date
              </label>
              <DatePicker
                selected={customEndDate}
                onChange={(date) => setCustomEndDate(date)}
                className="border border-gray-300 rounded px-3 py-2"
                maxDate={new Date()}
                placeholderText="Select end date"
              />
            </div>
          </div>
        )}
      </div> */}
      {/* <div className="mb-6">
        <div className="flex flex-wrap gap-4">
          <Input
            placeholder="Search by comment or user..."
            className="flex-1 min-w-[200px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <select
            value={filterType}
            onChange={(e) =>
              setFilterType(
                e.target.value as "All" | "Positive" | "Neutral" | "Negative"
              )
            }
            className="min-w-[150px] border border-gray-300 rounded px-3 py-2 text-gray-700"
          >
            <option value="All">All Types</option>
            <option value="Positive">Positive</option>
            <option value="Neutral">Neutral</option>
            <option value="Negative">Negative</option>
          </select>

          <select
            value={selectedCountry}
            onChange={(e) => {
              setSelectedCountry(e.target.value);
              setSelectedState("All");
            }}
            className="min-w-[150px] border border-gray-300 rounded px-3 py-2 text-gray-700"
          >
            <option value="All">All Countries</option>
            {country?.data.map((c) => (
              <option key={c.value} value={c.iso2}>
                {c.label}
              </option>
            ))}
          </select>

          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="min-w-[150px] border border-gray-300 rounded px-3 py-2 text-gray-700"
          >
            <option value="All">All States</option>
            {selectedCountryData?.states?.map((state) => (
              <option key={state.value} value={state.value}>
                {state.label}
              </option>
            ))}
          </select>
          <div>
            <select
              value={dateFilter}
              onChange={(e) =>
                setDateFilter(
                  e.target.value as "All" | "1M" | "3M" | "6M" | "Custom"
                )
              }
              className="min-w-[150px] border border-gray-300 rounded px-3 py-2 text-gray-700"
            >
              <option value="All">All Dates</option>
              <option value="1M">Last 1 Month</option>
              <option value="3M">Last 3 Months</option>
              <option value="6M">Last 6 Months</option>
              <option value="Custom">Custom Range</option>
            </select>
            {dateFilter === "Custom" && (
              <div className="flex flex-wrap gap-4 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    Start Date
                  </label>
                  <DatePicker
                    selected={customStartDate}
                    onChange={(date) => setCustomStartDate(date)}
                    className="border border-gray-300 rounded px-3 py-2 w-full"
                    maxDate={new Date()}
                    placeholderText="Select start date"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-1">
                    End Date
                  </label>
                  <DatePicker
                    selected={customEndDate}
                    onChange={(date) => setCustomEndDate(date)}
                    className="border border-gray-300 rounded px-3 py-2 w-full"
                    maxDate={new Date()}
                    placeholderText="Select end date"
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div> */}
      <div className="mb-6 space-y-4">
        {/* Row 1: Search + Type + Country + State + Date Filter */}
        <div className="flex flex-wrap gap-4">
          <Input
            placeholder="Search by comment or user..."
            className="flex-1 min-w-[200px]"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select
            value={filterType}
            onChange={(e) =>
              setFilterType(
                e.target.value as "All" | "Positive" | "Neutral" | "Negative"
              )
            }
            className="min-w-[150px] border dark:text-white dark:bg-gray-700 border-gray-300 rounded px-3 py-2 text-gray-700"
          >
            <option value="All">All Types</option>
            <option value="Positive">Positive</option>
            <option value="Neutral">Neutral</option>
            <option value="Negative">Negative</option>
          </select>

          <select
            value={selectedCountry}
            onChange={(e) => {
              setSelectedCountry(e.target.value);
              setSelectedState("All");
            }}
            className="min-w-[150px] dark:text-white dark:bg-gray-700 border border-gray-300 rounded px-3 py-2 text-gray-700"
          >
            <option value="All">All Countries</option>
            {country?.data.map((c) => (
              <option key={c.value} value={c.iso2}>
                {c.label}
              </option>
            ))}
          </select>

          <select
            value={selectedState}
            onChange={(e) => setSelectedState(e.target.value)}
            className="min-w-[150px] border dark:bg-gray-700 dark:text-white border-gray-300 rounded px-3 py-2 text-gray-700"
          >
            <option value="All">All States</option>
            {selectedCountryData?.states?.map((state) => (
              <option key={state.value} value={state.value}>
                {state.label}
              </option>
            ))}
          </select>

          <select
            value={dateFilter}
            onChange={(e) =>
              setDateFilter(
                e.target.value as "All" | "1M" | "3M" | "6M" | "Custom"
              )
            }
            className="min-w-[150px] border dark:bg-gray-700 dark:text-white border-gray-300 rounded px-3 py-2 text-gray-700"
          >
            <option value="All">All Dates</option>
            <option value="1M">Last 1 Month</option>
            <option value="3M">Last 3 Months</option>
            <option value="6M">Last 6 Months</option>
            <option value="Custom">Custom Range</option>
          </select>
        </div>

        {/* Row 2: Custom Date Range (only if Custom selected) */}
        {dateFilter === "Custom" && (
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="block text-sm font-medium dark:text-white text-gray-600 mb-1">
                Start Date
              </label>
              <DatePicker
                selected={customStartDate}
                onChange={(date) => setCustomStartDate(date)}
                className="border dark:text-white border-gray-300 rounded px-3 py-2 w-full"
                maxDate={new Date()}
                placeholderText="Select start date"
              />
            </div>
            <div>
              <label className="block text-sm font-medium dark:text-white text-gray-600 mb-1">
                End Date
              </label>
              <DatePicker
                selected={customEndDate}
                onChange={(date) => setCustomEndDate(date)}
                className="border border-gray-300 dark:text-white rounded px-3 py-2 w-full"
                maxDate={new Date()}
                placeholderText="Select end date"
                minDate={customStartDate || undefined}
              />
            </div>
          </div>
        )}
        {/* <button
          onClick={() => {
            // selectedCountry("All");
            setDateFilter("All");

            setCustomStartDate(null);
            setCustomEndDate(null);
          }}
          className="btn-simple text-red-600"
        >
          <X className="inline-block mr-1" /> Clear Filters
        </button> */}
      </div>

      {/* Table */}
      <div className="overflow-auto  rounded-lg shadow border">
        <table className="min-w-full dark:bg-gray-700  text-sm text-left text-gray-700 bg-white">
          <thead className="bg-gray-100  dark:bg-gray-700 dark:text-white text-xs font-semibold uppercase text-gray-600">
            <tr>
              <th className="px-6 py-3">Feedback Comment</th>
              <th className="px-6 py-3">Comment Type</th>
              <th className="px-6 py-3">When</th>
              <th className="px-6 py-3">By</th>
              <th></th>
              {/* <th className="px-6 py-3">Type</th> */}
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {filteredFeedbacks.length > 0 ? (
                filteredFeedbacks.map((fb) => (
                  <>
                    <motion.tr
                      key={fb.feedbackId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="border-t border-gray-200 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-600"
                    >
                      <td className="px-6 dark:text-white py-4 max-w-sm truncate">
                        {fb.commentText} (LineItemId:
                        <span className="text-blue-600">{fb.orderItemId}</span>)
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium  ${
                            fb.commentType === "Positive"
                              ? "bg-green-100 text-green-700"
                              : fb.commentType === "Neutral"
                              ? "bg-yellow-100 text-yellow-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {fb.commentType}
                        </span>
                      </td>
                      <td className="px-6 py-4 dark:text-white">
                        {new Date(fb.createdAt).toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}{" "}
                        (
                        {formatDistanceToNow(new Date(fb.createdAt), {
                          addSuffix: true,
                        })}
                        )
                      </td>
                      <td className="px-6 py-4 dark:text-white">
                        {fb.feedbackUser}
                      </td>
                      <td className="px-6 py-4 space-x-2 flex items-center">
                        <button
                          onClick={() =>
                            router.push(
                              `/variant/${fb.orderItem.variant.formattedShopifyId}`
                            )
                          }
                          className="text-sm px-3 py-1 rounded bg-blue-100 text-blue-700 hover:bg-blue-200 transition"
                        >
                          View Product
                        </button>

                        {!fb.feedbackResponse && (
                          <button
                            onClick={() => {
                              // Add your reply logic here
                              setReplyingTo(fb);
                              // console.log("Replying to feedbackId:", fb.feedbackId);
                            }}
                            className="text-sm px-3 py-1 rounded bg-green-100 text-green-700 hover:bg-green-200 transition"
                          >
                            Reply
                          </button>
                        )}

                        {/* <button
                        onClick={() => {
                          // Add your Zendrop feedback logic here
                          console.log(
                            "Sending feedback to Zendrop for:",
                            fb.orderItemId
                          );
                        }}
                        className="text-sm px-3 py-1 rounded bg-purple-100 text-purple-700 hover:bg-purple-200 transition"
                      >
                        Send to Zendrop
                      </button> */}
                      </td>
                    </motion.tr>
                    {fb.feedbackResponse && (
                      <motion.tr>
                        {/* <td colSpan={5}> */}
                          <motion.td colSpan={5}
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-2 px-4 ms-4 py-2 border-l-4 w-full border-green-400 bg-green-50 dark:bg-green-900 dark:text-green-100 rounded shadow-sm text-sm max-w-lg"
                          >
                            <p className="font-medium mb-1">Your Reply:</p>
                            <p className="whitespace-pre-line">
                              {fb.feedbackResponse}
                            </p>
                          </motion.td>
                        {/* </td> */}
                      </motion.tr>
                    )}
                  </>
                ))
              ) : (
                <motion.tr
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-center"
                >
                  <td colSpan={4} className="px-6 py-8 text-gray-400">
                    No feedbacks found.
                  </td>
                </motion.tr>
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
      <AnimatePresence>
        {replyingTo && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-transparent"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md shadow-xl relative"
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
            >
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-white"
                onClick={() => {
                  setReplyingTo(null);
                  setReplyMessage("");
                }}
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-lg font-semibold mb-4 dark:text-white">
                Reply to Feedback
              </h2>
              <p className="text-sm text-gray-500 mb-2 dark:text-gray-300">
                <strong>Buyer:</strong> {replyingTo.feedbackUser}
              </p>
              <p className="text-sm text-gray-500 mb-4 dark:text-gray-300">
                <strong>Comment:</strong> {replyingTo.commentText}
              </p>
              <textarea
                className="w-full h-24 border border-gray-300 rounded p-2 text-sm dark:bg-gray-700 dark:text-white"
                placeholder="Type your message to the buyer..."
                value={replyMessage}
                onChange={(e) => setReplyMessage(e.target.value)}
              />
              <button
                onClick={handleSendReply}
                disabled={loadingReply}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded transition disabled:opacity-50"
              >
                {loadingReply ? "Sending..." : "Send Message to Buyer"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Pages;
