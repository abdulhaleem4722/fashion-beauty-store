import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from "firebase/firestore";

import { db } from "../../firebase/firebase";

export default function Sales() {
  const [sales, setSales] = useState([]);
  const [filteredSales, setFilteredSales] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // =========================
  // FETCH SALES
  // =========================

  useEffect(() => {
    setLoading(true);
    setError("");

    const salesQuery = query(
      collection(db, "sales"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      salesQuery,
      (snapshot) => {
        const salesList = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }));

        setSales(salesList);
        setFilteredSales(salesList);
        setLoading(false);
      },
      (err) => {
        console.error("Sales fetch error:", err);

        setError(
          "Unable to load sales: " +
            (err.message || "Unknown error")
        );

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

    const search = value.toLowerCase().trim();

    if (!search) {
      setFilteredSales(sales);
      return;
    }

    const filtered = sales.filter((sale) => {
      return (
        sale.saleId?.toLowerCase().includes(search) ||
        sale.productName?.toLowerCase().includes(search) ||
        sale.customerName?.toLowerCase().includes(search) ||
        sale.customerPhone?.toLowerCase().includes(search) ||
        sale.sku?.toLowerCase().includes(search) ||
        sale.brand?.toLowerCase().includes(search)
      );
    });

    setFilteredSales(filtered);
  };

  // =========================
  // FORMAT DATE
  // =========================

  const formatDate = (createdAt) => {
    if (!createdAt) return "—";

    try {
      const date = createdAt.toDate
        ? createdAt.toDate()
        : new Date(createdAt);

      return date.toLocaleString("en-PK", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "—";
    }
  };

  // =========================
  // TOTAL SALES
  // =========================

  const totalSalesAmount = filteredSales.reduce(
    (total, sale) =>
      total + Number(sale.totalAmount || 0),
    0
  );

  const totalItemsSold = filteredSales.reduce(
    (total, sale) =>
      total + Number(sale.quantity || 0),
    0
  );

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#FAFAF9]">
        <div className="text-center">

          <svg
            className="mx-auto h-10 w-10 animate-spin text-[#C9A227]"
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

          <p className="mt-3 text-sm text-[#5B6478]">
            Loading sales...
          </p>

        </div>
      </div>
    );
  }

  // =========================
  // PAGE
  // =========================

  return (
    <div className="min-h-screen bg-[#FAFAF9]">

      {/* ================= HEADER ================= */}

      <header className="sticky top-0 z-50 bg-[#0B1220] text-white shadow-sm">

        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">

          <div>

            <span className="font-mono text-[11px] tracking-[0.3em] text-[#C9A227]">
              SALES
            </span>

            <h1 className="text-lg font-semibold sm:text-xl">
              Sales
            </h1>

          </div>

          <Link
            to="/admin/sales/add"
            className="rounded-md bg-[#C9A227] px-4 py-2 text-sm font-semibold text-[#0B1220] transition hover:bg-[#D8B33B]"
          >
            + Add Sale
          </Link>

        </div>

      </header>

      {/* ================= CONTENT ================= */}

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">

        {/* ERROR */}

        {error && (
          <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ================= SUMMARY ================= */}

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">

          <div className="rounded-lg border border-gray-200 bg-white p-5">

            <p className="text-xs font-medium uppercase tracking-wide text-[#5B6478]">
              Total sales
            </p>

            <p className="mt-2 text-2xl font-semibold text-[#111521]">
              {filteredSales.length}
            </p>

          </div>

          <div className="rounded-lg border border-gray-200 bg-white p-5">

            <p className="text-xs font-medium uppercase tracking-wide text-[#5B6478]">
              Items sold
            </p>

            <p className="mt-2 text-2xl font-semibold text-[#111521]">
              {totalItemsSold.toLocaleString()}
            </p>

          </div>

          <div className="rounded-lg border border-[#C9A227]/30 bg-white p-5">

            <p className="text-xs font-medium uppercase tracking-wide text-[#5B6478]">
              Sales revenue
            </p>

            <p className="mt-2 text-2xl font-semibold text-[#111521]">
              Rs. {totalSalesAmount.toLocaleString()}
            </p>

          </div>

        </div>

        {/* ================= SALES LIST ================= */}

        <div className="rounded-lg border border-gray-200 bg-white">

          {/* TOP */}

          <div className="border-b border-gray-200 p-4 sm:p-6">

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <h2 className="text-lg font-semibold text-[#111521]">
                  Sales history
                </h2>

                <p className="mt-1 text-sm text-[#5B6478]">
                  All sales recorded in your store.
                </p>

              </div>

              <div className="w-full sm:max-w-sm">

                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) =>
                    handleSearch(e.target.value)
                  }
                  placeholder="Search sales..."
                  className="w-full rounded-md border border-gray-300 px-4 py-2.5 text-sm text-[#111521] outline-none transition focus:border-[#0B1220] focus:ring-2 focus:ring-[#C9A227]/40"
                />

              </div>

            </div>

          </div>

          {/* ================= EMPTY ================= */}

          {filteredSales.length === 0 ? (

            <div className="px-6 py-16 text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                $
              </div>

              <h3 className="mt-4 text-sm font-semibold text-[#111521]">
                {searchQuery
                  ? "No matching sales"
                  : "No sales yet"}
              </h3>

              <p className="mt-1 text-sm text-[#5B6478]">
                {searchQuery
                  ? "Try another search."
                  : "Start by adding your first sale."}
              </p>

              {!searchQuery && (
                <Link
                  to="/admin/sales/add"
                  className="mt-5 inline-flex rounded-md bg-[#0B1220] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#16213D]"
                >
                  Add Sale
                </Link>
              )}

            </div>

          ) : (

            /* ================= TABLE ================= */

            <div className="overflow-x-auto">

              <table className="w-full min-w-[900px]">

                <thead className="border-b border-gray-200 bg-[#FAFAF9]">

                  <tr>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#5B6478]">
                      Product
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#5B6478]">
                      Customer
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#5B6478]">
                      Qty
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#5B6478]">
                      Sale price
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#5B6478]">
                      Total
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#5B6478]">
                      Payment
                    </th>

                    <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-[#5B6478]">
                      Date
                    </th>

                  </tr>

                </thead>

                <tbody className="divide-y divide-gray-100">

                  {filteredSales.map((sale) => (

                    <tr
                      key={sale.id}
                      className="transition hover:bg-[#FAFAF9]"
                    >

                      {/* PRODUCT */}

                      <td className="px-5 py-4">

                        <div className="flex items-center gap-3">

                          <img
                            src={
                              sale.imageUrl ||
                              "https://via.placeholder.com/80"
                            }
                            alt={sale.productName}
                            className="h-12 w-12 shrink-0 rounded-md border border-gray-200 object-cover"
                          />

                          <div className="min-w-0">

                            <p className="max-w-[220px] truncate text-sm font-semibold text-[#111521]">
                              {sale.productName ||
                                "Unnamed product"}
                            </p>

                            <p className="mt-0.5 text-xs text-[#5B6478]">
                              {sale.brand || ""}
                            </p>

                            <p className="font-mono text-[11px] text-[#5B6478]">
                              {sale.sku || "N/A"}
                            </p>

                          </div>

                        </div>

                      </td>

                      {/* CUSTOMER */}

                      <td className="px-5 py-4">

                        <p className="text-sm font-medium text-[#111521]">
                          {sale.customerName || "—"}
                        </p>

                        {sale.customerPhone && (
                          <p className="mt-1 text-xs text-[#5B6478]">
                            {sale.customerPhone}
                          </p>
                        )}

                      </td>

                      {/* QUANTITY */}

                      <td className="px-5 py-4">

                        <span className="text-sm font-semibold text-[#111521]">
                          {Number(sale.quantity || 0)}
                        </span>

                      </td>

                      {/* SALE PRICE */}

                      <td className="px-5 py-4">

                        <span className="text-sm text-[#111521]">
                          Rs.{" "}
                          {Number(
                            sale.salePrice || 0
                          ).toLocaleString()}
                        </span>

                      </td>

                      {/* TOTAL */}

                      <td className="px-5 py-4">

                        <span className="text-sm font-semibold text-[#111521]">
                          Rs.{" "}
                          {Number(
                            sale.totalAmount || 0
                          ).toLocaleString()}
                        </span>

                      </td>

                      {/* PAYMENT */}

                      <td className="px-5 py-4">

                        <div className="space-y-1">

                          <span className="inline-flex rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-[#111521]">
                            {sale.paymentMethod || "—"}
                          </span>

                          <p
                            className={`text-xs font-medium ${
                              sale.paymentStatus === "Paid"
                                ? "text-green-600"
                                : sale.paymentStatus ===
                                  "Partial"
                                ? "text-orange-600"
                                : "text-red-600"
                            }`}
                          >
                            {sale.paymentStatus || "—"}
                          </p>

                        </div>

                      </td>

                      {/* DATE */}

                      <td className="px-5 py-4">

                        <span className="whitespace-nowrap text-xs text-[#5B6478]">
                          {formatDate(sale.createdAt)}
                        </span>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>

      </main>

    </div>
  );
}