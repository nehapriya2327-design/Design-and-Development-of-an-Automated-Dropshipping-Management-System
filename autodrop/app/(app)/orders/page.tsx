"use client";
import { request } from "@/lib/api/handler";
import { Filter, MoreVertical, RefreshCw, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import country from "../../../utils/countries_states.json";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// interface orders {}

interface Order {
  id: string;
  buyerName?: string;
  totalPrice?: number;
  ebayListingPrice?: number;
  orderFulfillmentStatus: string;
  payment?: { ebayPrice?: number; paymentStatus?: string }[];
  shippingAddress?: {
    addressLine1?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  shopifyOrderId?: string;
  orderItem: OrderItem[];
  formattedShopifyOrderId: string;
  shopifyDraftOrderId?: string;
  ebayOrderid?: string;
  createdAt: Date;
}

interface OrderItem {
  variant: {
    imageUrl: string;
    product: {
      title: string;
    };
  };
}

interface EbayOrder {
  ebayOrderId: string;
}

interface ZendropCancelledOrder {
  cancelledOrder: ZendropOrder;
  ebayOrder: EbayOrder;
}

interface ZendropOrder {
  id: number;
  storeOrderId: string;
  isCancelledShopify: boolean;
  isCancelledEbay: boolean;
  createdAt: string;
}

type FilterConfig = {
  searchBuyer: string;
  searchOrderId: string;
  buyerSort: "asc" | "desc" | "none";
  selectedCountry: string;
  selectedState: string;
  dateSort: "asc" | "desc" | "none";
  dateFilter: "All" | "1M" | "3M" | "6M" | "Custom";
  searchProductTitle: string;
  customStartDate: Date | null;
  customEndDate: Date | null;
};

type SavedFilter = {
  id: number;
  config: FilterConfig;
};

const Page = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [cancelledZendropOrders, setCancelledZendropOrders] = useState<
    ZendropCancelledOrder[]
  >([]);
  const [cancelReasonDropdownOpenId, setCancelReasonDropdownOpenId] = useState<
    string | null
  >(null);
  const [activeTab, setActiveTab] = useState<
    "processed" | "unprocessed" | "cancelled"
  >("unprocessed");
  const [filtersVisible, setFiltersVisible] = useState(false);
  const [appliedFilterId, setAppliedFilterId] = useState<number | null>(null);

  const [dropdownOrderId, setDropdownOrderId] = useState<string | "">("");
  const [buyerSort, setBuyerSort] = useState<"asc" | "desc" | "none">("none");
  const [dateSort, setDateSort] = useState<"asc" | "desc" | "none">("none");
  const [searchBuyer, setSearchBuyer] = useState("");
  const [searchOrderId, setSearchOrderId] = useState("");
  const [filterShipping, setFilterShipping] = useState("");
  const [searchProductTitle, setSearchProductTitle] = useState("");
  const [selectedState, setSelectedState] = useState("All");
  const [selectedCountry, setSelectedCountry] = useState("All");
  const countryOptions = country?.data;
  const [dateFilter, setDateFilter] = useState<
    "All" | "1M" | "3M" | "6M" | "Custom"
  >("All");
  const [fulfillmentStatusTab, setFulfillmentStatusTab] = useState<
    "" | "Not_started" | "In_Progress" | "Fulfilled"
  >("");
  const [customStartDate, setCustomStartDate] = useState<Date | null>(null);
  const [customEndDate, setCustomEndDate] = useState<Date | null>(null);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const router = useRouter();
  const selectAllRef = useRef<HTMLInputElement>(null);

  const allUnprocessedOrderIds = orders
    .filter((order) => !order.shopifyOrderId)
    .map((order) => order.ebayOrderid);

  // Check if all are selected
  const isAllSelected =
    allUnprocessedOrderIds.length > 0 &&
    selectedOrders.length === allUnprocessedOrderIds.length;

  const unprocessedOrders = orders.filter(
    (o) => !o.shopifyOrderId && !o.shopifyDraftOrderId
  );
  const processedOrders = orders.filter(
    (o) => o.shopifyOrderId && o.shopifyDraftOrderId
  );

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate =
        selectedOrders.length > 0 && !isAllSelected;
    }
  }, [selectedOrders, isAllSelected]);

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (isAllSelected) {
      setSelectedOrders([]);
    } else {
      setSelectedOrders(
        allUnprocessedOrderIds.filter(
          (id): id is string => typeof id === "string"
        )
      );
    }
  };

  const fetchAllOrders = async () => {
    const response: { data: [] } = await request({
      method: "GET",
      url: "/ebay/order/all",
    });
    if (response) {
      setOrders(response.data);
    }
  };

  const fetchAllShopifyOrder = async () => {
    const response = await request({
      method: "GET",
      url: "/shopify/order/getOrderDetails",
    });
    if (response) {
      console.log(response);
    }
  };

  useEffect(() => {
    fetchAllShopifyOrder();
  }, []);

  const fetchZendropCancelledOrder = async () => {
    const response: ZendropCancelledOrder[] = await request({
      method: "GET",
      url: "/zendrop/orders/all",
    });

    if (response.length > 0) {
      setCancelledZendropOrders(response);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      await fetchAllOrders();
    };
    loadData();
  }, []);

  useEffect(() => {
    // if (orders.length > 0) {
    fetchZendropCancelledOrder();
    getFilters();
    // }
  }, []);

  interface CreateShopifyOrderResponse {
    success: boolean;
    message?: string;
    data?: unknown;
  }

  const createShopifyOrder = async (id: string) => {
    const response = await request<CreateShopifyOrderResponse>({
      method: "POST",
      url: "/shopify/order/createOrder",
      data: { id },
    });
    if (response) {
      fetchAllOrders();
    }
  };

  const cancelOrderOnEbay = async (id: string, reason: string) => {
    const response = await request({
      method: "POST",
      url: "ebay/order/cancelled-ebay",
      data: { orderId: id, reason },
    });
    if (response) {
      fetchZendropCancelledOrder();
    }
  };

  const handleCheckboxChange = (id: string) => {
    setSelectedOrders((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const createBulkShopifyOrders = async () => {
    if (selectedOrders.length === 0) return;
    const response = await request({
      method: "POST",
      url: "/shopify/order/bulkOrderCreate",
      data: { ids: selectedOrders },
    });
    if (response) {
      fetchAllOrders();
    }
  };

  const cancelOrderOnShopify = async (id: string) => {
    const response = await request({
      method: "POST",
      url: "/shopify/order/cancelled-shopify",
      data: { id: id },
    });
    if (response) {
      fetchZendropCancelledOrder();
    }
  };

  const getFilters = async () => {
    const response: { filters: [] } = await request({
      method: "GET",
      url: "/filters/get-filters?type=order",
    });
    if (response) setSavedFilters(response.filters);
  };

  const handleSaveFilters = async () => {
    const config = {
      searchBuyer,
      searchOrderId,
      buyerSort,
      selectedCountry,
      selectedState,
      dateSort,
      dateFilter,
      searchProductTitle,
      customStartDate,
      customEndDate,
    };
    const response = await request({
      method: "POST",
      url: "/filters/save-filters",
      data: {
        type: "order",
        config,
        userId: 1,
      },
    });
    if (response) {
      getFilters();
    }
  };

  const applySavedFilter = (filter: SavedFilter) => {
    setSearchBuyer(filter.config.searchBuyer || "");
    setSearchOrderId(filter.config.searchOrderId || "");
    setSearchProductTitle(filter.config.searchProductTitle || "");
    setBuyerSort(filter.config.buyerSort || "none");
    setDateSort(filter.config.dateSort || "none");
    setDateFilter(filter.config.dateFilter || "All");
    setSelectedCountry(filter.config.selectedCountry || "All");
    setSelectedState(filter.config.selectedState || "All");
    setCustomStartDate(
      filter.config.customStartDate
        ? new Date(filter.config.customStartDate)
        : null
    );
    setCustomEndDate(
      filter.config.customEndDate ? new Date(filter.config.customEndDate) : null
    );
    setAppliedFilterId(filter.id);
  };

  const selectedCountryData = countryOptions.find(
    (c) => c.iso2 === selectedCountry
  );

  const notStartedCount = orders.filter(
    (o) => o.orderFulfillmentStatus === "NOT_STARTED"
  ).length;

  const inProgressCount = orders.filter(
    (o) => o.orderFulfillmentStatus === "IN_PROGRESS"
  ).length;

  const fulfilledCount = orders.filter(
    (o) => o.orderFulfillmentStatus === "FULFILLED"
  ).length;

  const currentConfig: FilterConfig = {
    searchBuyer,
    searchOrderId,
    buyerSort,
    selectedCountry,
    selectedState,
    dateSort,
    dateFilter,
    searchProductTitle,
    customStartDate,
    customEndDate,
  };

  const isCurrentFilterModified = (): boolean => {
    if (appliedFilterId === null) return false;

    const appliedFilter = savedFilters.find((f) => f.id === appliedFilterId);
    if (!appliedFilter) return false;

    const normalize = (val: string | Date | null): string =>
      val instanceof Date ? val.toISOString() : val ?? "";

    for (const key of Object.keys(currentConfig) as (keyof FilterConfig)[]) {
      const current = normalize(currentConfig[key]);
      const original = normalize(appliedFilter.config[key]);
      if (current !== original) return true;
    }

    return false;
  };

  const formControlClass =
    "form-control px-4 py-2 min-h-[42px] border rounded-2xl text-sm bg-white dark:bg-gray-700 text-gray-800 dark:text-white shadow-sm";

  const renderFilters = () => (
    <div className="mb-6 p-6 border rounded-2xl shadow-sm bg-white dark:bg-gray-800">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Order ID */}
        <input
          placeholder="Search Order ID"
          className={formControlClass}
          value={searchOrderId}
          onChange={(e) => setSearchOrderId(e.target.value)}
        />

        {/* Buyer Name */}
        <input
          placeholder="Search Buyer Name"
          className={formControlClass}
          value={searchBuyer}
          onChange={(e) => setSearchBuyer(e.target.value)}
        />

        {/* Product Title */}
        <input
          placeholder="Search Product Title"
          className={formControlClass}
          value={searchProductTitle}
          onChange={(e) => setSearchProductTitle(e.target.value)}
        />

        {/* Country */}
        <Select
          value={selectedCountry}
          onValueChange={(value) => {
            setSelectedCountry(value);
            setSelectedState("All");
          }}
        >
          <SelectTrigger className={formControlClass}>
            <SelectValue placeholder="Select Country" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl bg-white dark:bg-gray-900 text-gray-800 dark:text-white shadow-lg border">
            <SelectItem
              value="All"
              className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-3 py-2 cursor-pointer"
            >
              All Countries
            </SelectItem>
            {country?.data.map((c) => (
              <SelectItem
                key={c.iso2}
                value={c.iso2}
                className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-3 py-2 cursor-pointer"
              >
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* State */}
        <Select value={selectedState} onValueChange={setSelectedState}>
          <SelectTrigger className={formControlClass}>
            <SelectValue placeholder="Select State" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl bg-white dark:bg-gray-900 text-gray-800 dark:text-white shadow-lg border">
            <SelectItem
              value="All"
              className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-3 py-2 cursor-pointer"
            >
              All States
            </SelectItem>
            {country?.data
              .find((c) => c.iso2 === selectedCountry)
              ?.states?.map((s) => (
                <SelectItem
                  key={s.value}
                  value={s.value}
                  className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-3 py-2 cursor-pointer"
                >
                  {s.label}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        {/* Buyer Sort */}
        <Select
          value={buyerSort}
          onValueChange={(val) => setBuyerSort(val as "asc" | "desc" | "none")}
        >
          <SelectTrigger className={formControlClass}>
            <SelectValue placeholder="Sort Buyer" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl bg-white dark:bg-gray-900 text-gray-800 dark:text-white shadow-lg border">
            <SelectItem
              value="none"
              className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-3 py-2 cursor-pointer"
            >
              Sort Buyer
            </SelectItem>
            <SelectItem
              value="asc"
              className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-3 py-2 cursor-pointer"
            >
              A to Z
            </SelectItem>
            <SelectItem
              value="desc"
              className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-3 py-2 cursor-pointer"
            >
              Z to A
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Date Sort */}
        <Select
          value={dateSort}
          onValueChange={(val) => setDateSort(val as "asc" | "desc" | "none")}
        >
          <SelectTrigger className={formControlClass}>
            <SelectValue placeholder="Sort Date" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl bg-white dark:bg-gray-900 text-gray-800 dark:text-white shadow-lg border">
            <SelectItem
              value="none"
              className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-3 py-2 cursor-pointer"
            >
              Sort Date
            </SelectItem>
            <SelectItem
              value="asc"
              className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-3 py-2 cursor-pointer"
            >
              Oldest First
            </SelectItem>
            <SelectItem
              value="desc"
              className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-3 py-2 cursor-pointer"
            >
              Newest First
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Date Filter */}
        <Select
          value={dateFilter}
          onValueChange={(val) =>
            setDateFilter(val as "All" | "1M" | "3M" | "6M" | "Custom")
          }
        >
          <SelectTrigger className={formControlClass}>
            <SelectValue placeholder="Date Range" />
          </SelectTrigger>
          <SelectContent className="rounded-2xl bg-white dark:bg-gray-900 text-gray-800 dark:text-white shadow-lg border">
            <SelectItem
              value="All"
              className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-3 py-2 cursor-pointer"
            >
              All Dates
            </SelectItem>
            <SelectItem
              value="1M"
              className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-3 py-2 cursor-pointer"
            >
              Last 1 Month
            </SelectItem>
            <SelectItem
              value="3M"
              className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-3 py-2 cursor-pointer"
            >
              Last 3 Months
            </SelectItem>
            <SelectItem
              value="6M"
              className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-3 py-2 cursor-pointer"
            >
              Last 6 Months
            </SelectItem>
            <SelectItem
              value="Custom"
              className="hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md px-3 py-2 cursor-pointer"
            >
              Custom
            </SelectItem>
          </SelectContent>
        </Select>

        {/* Custom Date Range */}
        {dateFilter === "Custom" && (
          <>
            <input
              type="date"
              className={formControlClass}
              onChange={(e) => setCustomStartDate(new Date(e.target.value))}
            />
            <input
              type="date"
              className={formControlClass}
              onChange={(e) => setCustomEndDate(new Date(e.target.value))}
            />
          </>
        )}

        {/* Buttons */}
        <div className="col-span-full flex gap-4 mt-4">
          <button
            onClick={() => {
              setSearchOrderId("");
              setSearchBuyer("");
              setFilterShipping("");
              setBuyerSort("none");
              setDateSort("none");
              setDateFilter("All");
              setSearchProductTitle("");
              setCustomStartDate(null);
              setCustomEndDate(null);
              setSelectedCountry("All");
              setSelectedState("All");
              setAppliedFilterId(null); // reset
            }}
            className="flex items-center gap-1 text-sm px-4 py-2 rounded-2xl border border-red-600 text-red-600 hover:bg-red-50 dark:hover:bg-red-900"
          >
            <X size={16} /> Clear Filters
          </button>

          {appliedFilterId && isCurrentFilterModified() ? (
            <button
              onClick={async () => {
                await request({
                  method: "PUT",
                  url: `/filters/update-filters/${appliedFilterId}`,
                  data: {
                    type: "order",
                    config: currentConfig,
                    userId: 1,
                  },
                });
                getFilters();
              }}
              className="text-sm px-4 py-2 rounded-2xl bg-blue-600 text-white hover:bg-blue-700"
            >
              Update Filter
            </button>
          ) : (
            <button
              onClick={handleSaveFilters}
              className="text-sm px-4 py-2 rounded-2xl bg-green-600 text-white hover:bg-green-700"
            >
              Save Filter
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderTable = (orders: Order[], showCheckboxes: boolean) => (
    <div className="w-full">
      {!showCheckboxes && (
        <div className="bg-white dark:bg-[#222938]">
          <button
            className={`px-4 py-2 rounded font-semibold ${
              fulfillmentStatusTab === ""
                ? "bg-[#7695e7] text-white "
                : "bg-white-200 text-gray-700 dark:text-white"
            }`}
            onClick={() => setFulfillmentStatusTab("")}
          >
            All Statuses ({orders.length})
          </button>
          <button
            className={`px-4 py-2 rounded font-semibold ${
              fulfillmentStatusTab === "Not_started"
                ? "bg-[#7695e7] text-white"
                : "bg-white-200 text-gray-700 dark:text-white"
            }`}
            onClick={() => setFulfillmentStatusTab("Not_started")}
          >
            Not Started ({notStartedCount})
          </button>
          <button
            className={`px-4 py-2 rounded font-semibold ${
              fulfillmentStatusTab === "In_Progress"
                ? "bg-[#7695e7] text-white"
                : "bg-white-200 text-gray-700 dark:text-white"
            }`}
            onClick={() => setFulfillmentStatusTab("In_Progress")}
          >
            In Progress ({inProgressCount})
          </button>
          <button
            className={`px-4 py-2 rounded font-semibold ${
              fulfillmentStatusTab === "Fulfilled"
                ? "bg-[#7695e7] text-white"
                : "bg-white-200 text-gray-700 dark:text-white"
            }`}
            onClick={() => setFulfillmentStatusTab("Fulfilled")}
          >
            Fulfilled ({fulfilledCount})
          </button>
        </div>
      )}
      <div className="grid">
        <div className="overflow-x-auto   scrollbar-thumb-[#7695e7] scrollbar-track-gray-100 dark:scrollbar-track-gray-800 w-full ">
          <table className=" w-[1500px] dark:bg-gray-700 bg-white border">
            <thead>
              <tr className="bg-gray-100 dark:bg-gray-700 text-left">
                {showCheckboxes && (
                  <th className="px-4 py-2 border">
                    <input
                      type="checkbox"
                      ref={selectAllRef}
                      onChange={handleSelectAll}
                      checked={isAllSelected}
                    />
                  </th>
                )}
                <th className="px-4 py-2 border">Product</th>
                <th className="px-4 py-2 border">Ebay Order Id</th>
                <th className="px-4 py-2 border">Buyer Name</th>
                <th className="px-4 py-2 border">Total Price</th>
                <th className="px-4 py-2 border">Listing Price</th>
                <th className="px-4 py-2 border">Due Amount</th>
                <th className="px-4 py-2 border">Fulfillment Status</th>
                {/* <th className="px-4 py-2 border">Payment Status</th> */}
                <th className="px-4 py-2 border">Shipping Address</th>
                <th className="px-4 py-2 border">Date</th>
                {!showCheckboxes && (
                  <th className="px-4 py-2 border">Shopify Order Id</th>
                )}
                {showCheckboxes && <th className="px-4 py-2 border">Action</th>}
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const fullShippingAddress = order?.shippingAddress
                  ? `${order.shippingAddress.addressLine1}, ${order.shippingAddress.city}, ${order.shippingAddress.state}, ${order.shippingAddress.zipCode}, ${order.shippingAddress.country}`
                  : "N/A";

                return (
                  <tr key={order.id}>
                    {showCheckboxes && (
                      <td className="px-4 py-2 border">
                        {!order.shopifyOrderId && order.ebayOrderid && (
                          <input
                            type="checkbox"
                            onChange={() =>
                              order.ebayOrderid &&
                              handleCheckboxChange(order.ebayOrderid)
                            }
                            checked={
                              order.ebayOrderid
                                ? selectedOrders.includes(order.ebayOrderid)
                                : false
                            }
                          />
                        )}
                      </td>
                    )}
                    <td className="px-4 py-2 border min-w-64 ">
                      {order.orderItem && order.orderItem.length > 0 ? (
                        <div className="flex items-center space-x-2">
                          <img
                            src={order.orderItem[0].variant?.imageUrl}
                            alt="Product"
                            className="w-12 h-12 object-contain border rounded"
                          />
                          <span>
                            {order.orderItem[0].variant?.product?.title ||
                              "No Title"}
                          </span>
                        </div>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td
                      className="hover:cursor-pointer px-4 py-2 border"
                      onClick={() =>
                        router.push(`orders/${order?.ebayOrderid}`)
                      }
                    >
                      {order?.ebayOrderid}
                    </td>
                    <td className="px-4 py-2 border">{order?.buyerName}</td>
                    <td className="px-4 py-2 border">{order?.totalPrice}</td>
                    <td className="px-4 py-2 border">
                      {order?.ebayListingPrice}
                    </td>
                    <td className="px-4 py-2 border">
                      {order?.payment?.[0]?.ebayPrice}
                    </td>
                    <td className="px-4 py-2 border ">
                      <span
                        className={`px-2 py-1 rounded text-xs font-medium
      ${
        order?.orderFulfillmentStatus === "FULFILLED"
          ? "bg-green-100 text-green-800"
          : order?.orderFulfillmentStatus === "IN_PROGRESS"
          ? "bg-yellow-100 text-yellow-800"
          : order?.orderFulfillmentStatus === "NOT_STARTED"
          ? "bg-red-100 text-red-800"
          : "bg-gray-100 text-gray-800"
      }
    `}
                      >
                        {order?.orderFulfillmentStatus}
                      </span>
                    </td>
                    {/* <td className="px-4 py-2 border">
                  {order.payment?.[0]?.paymentStatus}
                </td> */}
                    <td className="px-4 py-2 border min-w-64">
                      {fullShippingAddress}
                    </td>
                    <td className="px-4 py-2 border">
                      {order?.createdAt
                        ? new Date(order.createdAt).toLocaleDateString()
                        : "N/A"}
                    </td>
                    {order.shopifyOrderId && (
                      <td className="px-4 py-2 border">
                        {order.shopifyOrderId}
                      </td>
                    )}
                    {!order.shopifyOrderId && (
                      <td className="px-4 py-2 border space-x-2">
                        {!order.shopifyOrderId && (
                          <button
                            className="btn-simple"
                            title="Create order on Shopify"
                            onClick={() =>
                              order.ebayOrderid &&
                              createShopifyOrder(order.ebayOrderid)
                            }
                          >
                            <RefreshCw size={16} />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center p-4">
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const getFilteredOrders = (orderList: Order[]) => {
    let filtered = [...orderList];

    if (searchOrderId)
      filtered = filtered.filter((o) => o.ebayOrderid?.includes(searchOrderId));
    if (searchBuyer)
      filtered = filtered.filter((o) =>
        o.buyerName?.toLowerCase().includes(searchBuyer.toLowerCase())
      );
    if (filterShipping)
      filtered = filtered.filter((o) =>
        `${o.shippingAddress?.addressLine1} ${o.shippingAddress?.city}`
          .toLowerCase()
          .includes(filterShipping.toLowerCase())
      );

    if (dateFilter !== "All") {
      const start = new Date();
      if (dateFilter === "1M") start.setMonth(start.getMonth() - 1);
      if (dateFilter === "3M") start.setMonth(start.getMonth() - 3);
      if (dateFilter === "6M") start.setMonth(start.getMonth() - 6);
      if (dateFilter === "Custom" && customStartDate)
        start.setTime(customStartDate.getTime());
      const end = customEndDate || new Date();
      filtered = filtered.filter((o) => {
        const date = new Date(o.createdAt || "");
        return date >= start && date <= end;
      });
    }

    if (fulfillmentStatusTab) {
      filtered = filtered.filter(
        (o) =>
          o.orderFulfillmentStatus?.toLowerCase() ===
          fulfillmentStatusTab.toLowerCase()
      );
    }

    if (searchProductTitle) {
      filtered = filtered.filter((o) =>
        o.orderItem?.some((item) =>
          item.variant?.product?.title
            ?.toLowerCase()
            .includes(searchProductTitle.toLowerCase())
        )
      );
    }

    if (buyerSort !== "none") {
      filtered.sort((a, b) => {
        const nameA = a.buyerName || "";
        const nameB = b.buyerName || "";
        return buyerSort === "asc"
          ? nameA.localeCompare(nameB)
          : nameB.localeCompare(nameA);
      });
    }

    if (dateSort !== "none") {
      filtered.sort((a, b) => {
        const dateA = new Date(a.createdAt || "").getTime();
        const dateB = new Date(b.createdAt || "").getTime();
        return dateSort === "asc" ? dateA - dateB : dateB - dateA;
      });
    }

    return filtered;
  };

  const renderZendropTable = () => (
    <table className="min-w-full dark:bg-gray-700 bg-white border">
      <thead>
        <tr className="bg-gray-100 dark:bg-gray-700 text-left">
          <th className="px-4 py-2 border">#</th>
          <th className="px-4 py-2 border">Store Order ID</th>
          <th className="px-4 py-2 border">Cancelled on Shopify</th>
          <th className="px-4 py-2 border">Cancelled on Ebay</th>
          <th className="px-4 py-2 border">Cancelled At</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        {cancelledZendropOrders
          .filter(
            (
              order
            ): order is {
              cancelledOrder: ZendropOrder;
              ebayOrder: EbayOrder;
            } => order !== null
          )
          .map((order, index) => (
            <tr key={order.cancelledOrder.id}>
              <td className="px-4 py-2 border">{index + 1}</td>
              <td className="px-4 py-2 border">
                {order?.cancelledOrder.storeOrderId}
              </td>
              <td className="px-4 py-2 border">
                {order?.cancelledOrder.isCancelledShopify ? "Yes" : "No"}
              </td>
              <td className="px-4 py-2 border">
                {order?.cancelledOrder.isCancelledEbay ? "Yes" : "No"}
              </td>
              <td className="px-4 py-2 border">
                {new Date(order?.cancelledOrder.createdAt).toLocaleDateString()}
              </td>
              <td className="relative py-2 border">
                <div className="relative inline-block text-left">
                  <MoreVertical
                    className="h-5 w-5 cursor-pointer text-subtle"
                    onClick={() =>
                      setDropdownOrderId((prev) =>
                        prev === order?.cancelledOrder.storeOrderId
                          ? ""
                          : order?.cancelledOrder.storeOrderId
                      )
                    }
                  />
                  {dropdownOrderId === order.cancelledOrder.storeOrderId && (
                    <div className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 focus:outline-none">
                      <div className="py-1">
                        <button
                          className="w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => {
                            // Call cancel on Shopify logic here
                            cancelOrderOnShopify(
                              order.cancelledOrder.storeOrderId
                            );
                            console.log(
                              "Cancel on Shopify",
                              order.cancelledOrder.storeOrderId
                            );
                            setDropdownOrderId("");
                          }}
                        >
                          Cancel Order on Shopify
                        </button>
                        <button
                          onClick={() => {
                            setCancelReasonDropdownOpenId((prev) =>
                              prev === order.cancelledOrder.storeOrderId
                                ? null
                                : order.cancelledOrder.storeOrderId
                            );
                          }}
                          className="w-full px-4 py-2 text-sm text-left text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          Cancel Order on eBay
                        </button>
                        {cancelReasonDropdownOpenId ===
                          order.cancelledOrder.storeOrderId && (
                          <div className="absolute z-20 mt-2 w-56 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5">
                            <ul>
                              {[
                                "BUYER_CANCEL",
                                "OUT_OF_STOCK_OR_CANNOT_FULFILL",
                                "ADDRESS_NOT_VERIFIED",
                                "OTHER",
                              ].map((reason) => (
                                <li
                                  key={reason}
                                  onClick={() => {
                                    cancelOrderOnEbay(
                                      order.ebayOrder.ebayOrderId,
                                      reason
                                    );
                                    setCancelReasonDropdownOpenId(null);
                                    setDropdownOrderId("");
                                  }}
                                  className="px-4 py-2 text-sm text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                >
                                  {reason.replace(/_/g, " ")}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </td>
            </tr>
          ))}
        {cancelledZendropOrders.length === 0 && (
          <tr>
            <td colSpan={5} className="text-center p-4">
              No Zendrop cancellations found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  );
  const renderActiveTable = () => {
    const ordersToRender =
      activeTab === "unprocessed"
        ? getFilteredOrders(unprocessedOrders)
        : activeTab === "processed"
        ? getFilteredOrders(processedOrders)
        : [];

    return (
      <div className="">
        {filtersVisible && renderFilters()}
        <button
          className="py-2 flex align-middle px-5 border dark:bg-gray-700 mb-3 bg-white rounded font-semibold"
          onClick={() => setFiltersVisible(!filtersVisible)}
        >
          <Filter className="h-5 w-5 text-muted-foreground" />
          {filtersVisible ? "Hide Filters" : "Add Filter"}
        </button>
        <div className="flex flex-wrap items-center gap-2 mb-4">
          <h3 className="text-base font-semibold text-gray-800 dark:text-white">
            Saved Filters:
          </h3>
          {savedFilters?.length === 0 ? (
            <span className="text-sm text-gray-500 dark:text-gray-300">
              None
            </span>
          ) : (
            savedFilters.map((filter: { id: number; config: any }) => {
              const label =
                filter.config.searchOrderId ||
                filter.config.searchBuyer ||
                `#${filter.id}`;
              return (
                <button
                  key={filter.id}
                  onClick={() => applySavedFilter(filter)}
                  title={`Order ID: ${
                    filter.config.searchOrderId || "N/A"
                  }\nBuyer: ${filter.config.searchBuyer || "N/A"}\nCountry: ${
                    filter.config.selectedCountry || "All"
                  }\nState: ${filter.config.selectedState || "All"}`}
                  className="px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 transition"
                >
                  {label}
                </button>
              );
            })
          )}
        </div>
        {activeTab === "unprocessed" && (
          <div>{renderTable(ordersToRender, true)}</div>
        )}
        {activeTab === "processed" && (
          <div>{renderTable(ordersToRender, false)}</div>
        )}
        {/* Your existing renderTable code here, pass ordersToRender instead of unprocessedOrders/processedOrders */}
      </div>
    );
  };

  return (
    <div className="my-8  px-8">
      <h1 className="text-3xl  font-bold text-foreground mb-6">Orders</h1>
      <div className="flex space-x-4 mb-6">
        <button
          className={`px-4 py-2 rounded font-semibold ${
            activeTab === "unprocessed"
              ? "bg-[#7695e7] text-white"
              : "bg-gray-200 text-gray-700 dark:bg-black dark:text-white"
          }`}
          onClick={() => setActiveTab("unprocessed")}
        >
          Orders from Ebay
        </button>
        <button
          className={`px-4 py-2 rounded font-semibold ${
            activeTab === "processed"
              ? "bg-[#7695e7] text-white"
              : "bg-gray-200 text-gray-700 dark:bg-black dark:text-white"
          }`}
          onClick={() => setActiveTab("processed")}
        >
          Orders Created on Shopify
        </button>
        <button
          className={`px-4 py-2 rounded font-semibold ${
            activeTab === "cancelled"
              ? "bg-red-600 text-white"
              : "bg-gray-200 text-gray-700 dark:bg-black dark:text-white"
          }`}
          onClick={() => setActiveTab("cancelled")}
        >
          Cancelled on Zendrop
        </button>
      </div>
      {activeTab === "unprocessed" && (
        <div className="text-right mb-3">
          <button
            className="py-2 px-5 border dark:bg-gray-700 bg-white rounded font-semibold"
            onClick={createBulkShopifyOrders}
          >
            Bulk Order In Shopify
          </button>
        </div>
      )}

      {activeTab === "cancelled" ? (
        // <div>{renderTable(cancelledZendropOrders, false)}</div>
        <div>{renderZendropTable()}</div>
      ) : (
        <div>{renderActiveTable()}</div>
      )}
    </div>
  );
};

export default Page;
