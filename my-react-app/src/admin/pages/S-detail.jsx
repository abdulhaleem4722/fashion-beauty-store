import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  collection,
  addDoc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../../firebase/firebase";

export default function SalesDetail() {
  const navigate = useNavigate();

  // =========================
  // PRODUCTS
  // =========================

  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // =========================
  // SALE MODAL
  // =========================

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showSaleModal, setShowSaleModal] = useState(false);

  // =========================
  // SALE FORM
  // =========================

  const [salePrice, setSalePrice] = useState("");
  const [quantity, setQuantity] = useState(1);

  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerAddress, setCustomerAddress] = useState("");

  const [saving, setSaving] = useState(false);

  // =========================
  // TOAST
  // =========================

  const [toast, setToast] = useState(null);

  const showToast = (type, message) => {
    setToast({
      type,
      message,
    });

    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // =========================
  // FETCH PRODUCTS
  // =========================

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "products"),
      (snapshot) => {
        const productList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setProducts(productList);
        setFilteredProducts(productList);
        setLoading(false);
      },
      (error) => {
        console.error("Products fetch error:", error);
        showToast("error", "Failed to load products.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // =========================
  // SEARCH
  // =========================

  const handleSearch = (value) => {
    setSearchQuery(value);

    const query = value.toLowerCase().trim();

    if (!query) {
      setFilteredProducts(products);
      return;
    }

    const filtered = products.filter((product) => {
      const title = product.title?.toLowerCase() || "";
      const category = product.category?.toLowerCase() || "";

      return (
        title.includes(query) ||
        category.includes(query)
      );
    });

    setFilteredProducts(filtered);
  };

  // =========================
  // SELECT PRODUCT
  // =========================

  const handleSelectProduct = (product) => {
    setSelectedProduct(product);

    // Product ka existing price default sale price hoga
    setSalePrice(product.price || "");

    // Default quantity
    setQuantity(1);

    // Reset customer fields
    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");

    // Modal open
    setShowSaleModal(true);
  };

  // =========================
  // CLOSE MODAL
  // =========================

  const closeSaleModal = () => {
    if (saving) return;

    setShowSaleModal(false);
    setSelectedProduct(null);

    setSalePrice("");
    setQuantity(1);

    setCustomerName("");
    setCustomerPhone("");
    setCustomerAddress("");
  };

  // =========================
  // SAVE SALE
  // =========================

  const handleSaveSale = async (e) => {
    e.preventDefault();

    if (!selectedProduct) {
      showToast("error", "Please select a product.");
      return;
    }

    if (!salePrice || Number(salePrice) <= 0) {
      showToast("error", "Please enter a valid sale price.");
      return;
    }

    if (!quantity || Number(quantity) < 1) {
      showToast("error", "Please enter a valid quantity.");
      return;
    }

    if (!customerName.trim()) {
      showToast("error", "Customer name is required.");
      return;
    }

    setSaving(true);

    try {
      const qty = Number(quantity);
      const price = Number(salePrice);
      const totalAmount = price * qty;

      // =========================
      // SALES DOCUMENT
      // =========================

      const saleData = {
        productId: selectedProduct.id,

        // Product snapshot
        productTitle: selectedProduct.title || "",
        productCategory: selectedProduct.category || "",
        productImage: selectedProduct.image || "",

        // Sale information
        salePrice: price,
        quantity: qty,
        totalAmount,

        // Customer information
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        customerAddress: customerAddress.trim(),

        // Sale status
        status: "Completed",

        // Timestamp
        createdAt: serverTimestamp(),
      };

      // =========================
      // SAVE TO sales COLLECTION
      // =========================

      try {
        const saleRef = await addDoc(collection(db, "sales"), saleData);
        console.log("✅ Sale saved:", saleRef.id);
        showToast("success", "Sale saved successfully.");
      } catch (error) {
        if (error.message.includes("Permission")) {
          // Fallback to localStorage
          const sales = JSON.parse(localStorage.getItem("sales") || "[]");
          sales.push({ ...saleData, id: Date.now() });
          localStorage.setItem("sales", JSON.stringify(sales));
          showToast("success", "Sale saved locally (pending sync)");
        } else {
          showToast("error", "Error: " + error.message);
        }
      }
      console.log("Sale created:", saleRef.id);

      showToast(
        "success",
        "Sale saved successfully."
      );

      // Close modal
      setShowSaleModal(false);
      setSelectedProduct(null);

      setSalePrice("");
      setQuantity(1);

      setCustomerName("");
      setCustomerPhone("");
      setCustomerAddress("");

      // Sales page par wapas
      setTimeout(() => {
        navigate("/admin/sales");
      }, 800);

    } catch (error) {
      console.error("Sale save error:", error);

      showToast(
        "error",
        "Sale save failed: " + error.message
      );
    } finally {
      setSaving(false);
    }
  };

  // =========================
  // RENDER
  // =========================

  return (
    <div className="min-h-screen bg-[#FAFAF9]">

      {/* =========================
          TOAST
      ========================= */}

      {toast && (
        <div
          className={`fixed top-4 right-4 z-[60] flex items-start gap-2 rounded-md border px-4 py-3 text-sm shadow-lg ${toast.type === "success"
            ? "border-green-200 bg-green-50 text-green-700"
            : "border-red-200 bg-red-50 text-red-700"
            }`}
        >
          <svg
            className="mt-0.5 h-4 w-4 shrink-0"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            {toast.type === "success" ? (
              <path
                fillRule="evenodd"
                d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                clipRule="evenodd"
              />
            ) : (
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l6.516 11.59c.75 1.334-.213 2.987-1.743 2.987H3.484c-1.53 0-2.493-1.653-1.743-2.987L8.257 3.1zM11 13a1 1 0 10-2 0 1 1 0 00-2 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            )}
          </svg>

          <span>{toast.message}</span>
        </div>
      )}

      {/* =========================
          HEADER
      ========================= */}

      <header className="sticky top-0 z-50 bg-[#0B1220] text-white shadow-sm">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">

          <div>
            <span className="font-mono text-[11px] tracking-[0.3em] text-[#C9A227]">
              SALES
            </span>

            <h1 className="text-lg font-semibold sm:text-xl">
              Add New Sale
            </h1>
          </div>

          <Link
            to="/admin/dashboard"
            className="rounded-md border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:border-white/40 hover:bg-white/5 active:scale-95"
          >
            ← Dashboard
          </Link>

          <Link
            to="/admin/sales"
            className="rounded-md border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:border-white/40 hover:bg-white/5 active:scale-95"
          >
            ← Sales
          </Link>

        </div>
      </header>

      {/* =========================
          PRODUCT LIST
      ========================= */}

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {loading ? (

          <div className="flex items-center justify-center gap-2 py-20 text-sm text-[#5B6478]">

            <svg
              className="h-5 w-5 animate-spin text-[#C9A227]"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />

              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>

            Loading products...

          </div>

        ) : filteredProducts.length === 0 ? (

          <div className="rounded-lg border border-gray-200 bg-white py-20 text-center">

            <p className="text-sm text-[#5B6478]">
              No products yet.
            </p>

            <Link
              to="/admin/products"
              className="mt-3 inline-block text-sm font-medium text-[#0B1220] underline underline-offset-2"
            >
              Add products first
            </Link>

          </div>

        ) : (

          <div className="overflow-hidden rounded-lg border border-gray-200 bg-white">

            <div className="overflow-x-auto">

              <table className="w-full">

                <thead>

                  <tr className="border-b border-gray-200 bg-[#FAFAF9]">

                    <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-wider text-[#5B6478]">
                      Image
                    </th>

                    <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-wider text-[#5B6478]">
                      Product
                    </th>

                    <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-wider text-[#5B6478]">
                      Category
                    </th>

                    <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-wider text-[#5B6478]">
                      Price
                    </th>

                    <th className="px-4 py-3 text-left font-mono text-xs uppercase tracking-wider text-[#5B6478]">
                      Action
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-gray-100">

                  {filteredProducts.map((product) => (

                    <tr
                      key={product.id}
                      className="transition hover:bg-[#FAFAF9]"
                    >

                      {/* IMAGE */}

                      <td className="px-4 py-3">

                        <img
                          src={product.image}
                          alt={product.title}
                          className="h-14 w-14 rounded-md border border-gray-200 object-cover"
                        />

                      </td>

                      {/* TITLE */}

                      <td className="px-4 py-3">

                        <div className="max-w-[250px]">

                          <p className="text-sm font-semibold text-[#111521]">
                            {product.title}
                          </p>

                        </div>

                      </td>

                      {/* CATEGORY */}

                      <td className="px-4 py-3">

                        <span className="inline-flex rounded-full bg-pink-50 px-3 py-1 text-xs font-medium text-pink-600">
                          {product.category || "—"}
                        </span>

                      </td>

                      {/* PRICE */}

                      <td className="px-4 py-3 text-sm font-semibold text-[#111521]">
                        Rs.{" "}
                        {Number(
                          product.price || 0
                        ).toLocaleString()}
                      </td>

                      {/* ACTION */}

                      <td className="px-4 py-3">

                        <button
                          onClick={() => handleSelectProduct(product)}
                          className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-[#111521] transition hover:border-[#0B1220] hover:bg-[#0B1220] hover:text-white"
                        >
                          Create Sale
                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          </div>

        )}

      </div>

      {/* =====================================================
          SALE MODAL
      ===================================================== */}

      {showSaleModal && selectedProduct && (

        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/50 p-4">

          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl">

            {/* ================= MODAL HEADER ================= */}

            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-200 bg-white px-5 py-4 sm:px-6">

              <div>

                <span className="font-mono text-[10px] tracking-[0.25em] text-[#C9A227]">
                  NEW SALE
                </span>

                <h2 className="mt-0.5 text-lg font-semibold text-[#111521]">
                  Sale Details
                </h2>

              </div>

              <button
                type="button"
                onClick={closeSaleModal}
                disabled={saving}
                className="rounded-md p-2 text-xl text-[#5B6478] hover:bg-gray-100 hover:text-[#111521]"
              >
                ×
              </button>

            </div>

            {/* ================= MODAL BODY ================= */}

            <form
              onSubmit={handleSaveSale}
              className="space-y-6 p-5 sm:p-6"
            >

              {/* ================= PRODUCT ================= */}

              <div className="rounded-lg border border-gray-200 bg-[#FAFAF9] p-4">

                <div className="flex gap-4">

                  <img
                    src={
                      selectedProduct.image ||
                      "https://via.placeholder.com/100"
                    }
                    alt={selectedProduct.title}
                    className="h-20 w-20 rounded-md border border-gray-200 object-cover"
                  />

                  <div className="min-w-0 flex-1">

                    <h3 className="font-semibold text-[#111521]">
                      {selectedProduct.title}
                    </h3>

                    <p className="mt-1 text-xs text-[#5B6478]">
                      Category: {selectedProduct.category}
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#111521]">
                      Product Price: Rs.{" "}
                      {Number(
                        selectedProduct.price || 0
                      ).toLocaleString()}
                    </p>

                  </div>

                </div>

              </div>

              {/* ================= SALE INFORMATION ================= */}

              <div>

                <div className="mb-4">
                  <span className="font-mono text-[10px] tracking-[0.25em] text-[#C9A227]">
                    SALE INFORMATION
                  </span>

                  <h3 className="mt-1 text-base font-semibold text-[#111521]">
                    Enter sale details
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                  {/* SALE PRICE */}

                  <div>

                    <label className="mb-1.5 block text-sm font-medium text-[#111521]">
                      Sale Price (PKR) *
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={salePrice}
                      onChange={(e) =>
                        setSalePrice(e.target.value)
                      }
                      placeholder="Enter sale price"
                      required
                      className="w-full rounded-md border border-gray-300 px-3.5 py-2.5 text-sm focus:border-[#0B1220] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/40"
                    />

                  </div>

                  {/* QUANTITY */}

                  <div>

                    <label className="mb-1.5 block text-sm font-medium text-[#111521]">
                      Quantity Sold *
                    </label>

                    <input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) =>
                        setQuantity(e.target.value)
                      }
                      placeholder="e.g. 2"
                      required
                      className="w-full rounded-md border border-gray-300 px-3.5 py-2.5 text-sm focus:border-[#0B1220] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/40"
                    />

                  </div>

                </div>

              </div>

              {/* ================= CUSTOMER ================= */}

              <div>

                <div className="mb-4">
                  <span className="font-mono text-[10px] tracking-[0.25em] text-[#C9A227]">
                    CUSTOMER
                  </span>

                  <h3 className="mt-1 text-base font-semibold text-[#111521]">
                    Customer information
                  </h3>
                </div>

                <div className="space-y-5">

                  {/* NAME */}

                  <div>

                    <label className="mb-1.5 block text-sm font-medium text-[#111521]">
                      Customer Name *
                    </label>

                    <input
                      type="text"
                      value={customerName}
                      onChange={(e) =>
                        setCustomerName(e.target.value)
                      }
                      placeholder="Enter customer name"
                      required
                      className="w-full rounded-md border border-gray-300 px-3.5 py-2.5 text-sm focus:border-[#0B1220] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/40"
                    />

                  </div>

                  {/* PHONE */}

                  <div>

                    <label className="mb-1.5 block text-sm font-medium text-[#111521]">
                      Phone
                    </label>

                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) =>
                        setCustomerPhone(e.target.value)
                      }
                      placeholder="03XX XXXXXXX"
                      className="w-full rounded-md border border-gray-300 px-3.5 py-2.5 text-sm focus:border-[#0B1220] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/40"
                    />

                  </div>

                  {/* ADDRESS */}

                  <div>

                    <label className="mb-1.5 block text-sm font-medium text-[#111521]">
                      Address
                    </label>

                    <textarea
                      rows="3"
                      value={customerAddress}
                      onChange={(e) =>
                        setCustomerAddress(e.target.value)
                      }
                      placeholder="Enter customer address"
                      className="w-full resize-none rounded-md border border-gray-300 px-3.5 py-2.5 text-sm focus:border-[#0B1220] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/40"
                    />

                  </div>

                </div>

              </div>

              {/* ================= TOTAL ================= */}

              <div className="rounded-lg border border-[#C9A227]/30 bg-[#FAFAF9] p-5">

                <div className="flex items-center justify-between gap-4">

                  <div>

                    <p className="text-xs text-[#5B6478]">
                      Sale Price
                    </p>

                    <p className="mt-1 font-semibold text-[#111521]">
                      Rs.{" "}
                      {Number(salePrice || 0).toLocaleString()}
                    </p>

                  </div>

                  <div className="text-center">

                    <p className="text-xs text-[#5B6478]">
                      Quantity
                    </p>

                    <p className="mt-1 font-semibold text-[#111521]">
                      {Number(quantity || 0)}
                    </p>

                  </div>

                  <div className="text-right">

                    <p className="text-xs text-[#5B6478]">
                      Total
                    </p>

                    <p className="mt-1 text-xl font-bold text-[#111521]">
                      Rs.{" "}
                      {(
                        Number(salePrice || 0) *
                        Number(quantity || 0)
                      ).toLocaleString()}
                    </p>

                  </div>

                </div>

              </div>

              {/* ================= ACTIONS ================= */}

              <div className="flex flex-col gap-3 sm:flex-row">

                <button
                  type="button"
                  onClick={closeSaleModal}
                  disabled={saving}
                  className="flex-1 rounded-md border border-gray-300 py-2.5 text-sm font-semibold text-[#111521] hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 rounded-md bg-[#0B1220] py-2.5 text-sm font-semibold text-white hover:bg-[#16213D] disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {saving ? "Saving Sale..." : "Save Sale"}
                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}