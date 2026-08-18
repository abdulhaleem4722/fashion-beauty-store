import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
    collection,
    getDocs,
    doc,
    deleteDoc,
    updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase/firebase";

function ManageProducts() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingProduct, setEditingProduct] = useState(null);
    const [savingEdit, setSavingEdit] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [toast, setToast] = useState(null);

    const categories = ["Makeup", "Skincare", "Haircare"];

    // =========================
    // TOAST
    // =========================

    const showToast = (type, message) => {
        setToast({ type, message });

        setTimeout(() => {
            setToast(null);
        }, 3500);
    };

    // =========================
    // FETCH PRODUCTS
    // =========================

    const fetchProducts = useCallback(async () => {
        setLoading(true);

        try {
            const querySnapshot = await getDocs(
                collection(db, "products")
            );

            const productList = querySnapshot.docs.map((productDoc) => ({
                id: productDoc.id,
                ...productDoc.data(),
            }));

            setProducts(productList);
        } catch (error) {
            showToast(
                "error",
                "Couldn't load products: " + error.message
            );
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    // =========================
    // DELETE PRODUCT
    // =========================

    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            "Delete this product permanently? This can't be undone."
        );

        if (!confirmed) return;

        setDeletingId(id);

        try {
            await deleteDoc(doc(db, "products", id));

            showToast("success", "Product deleted successfully.");

            fetchProducts();
        } catch (error) {
            showToast(
                "error",
                "Couldn't delete product: " + error.message
            );
        } finally {
            setDeletingId(null);
        }
    };

    // =========================
    // OPEN EDIT MODAL
    // =========================

    const handleEditClick = (product) => {
        setEditingProduct({
            ...product,
        });
    };

    // =========================
    // UPDATE PRODUCT
    // =========================

    const handleUpdate = async (e) => {
        e.preventDefault();

        if (!editingProduct) return;

        setSavingEdit(true);

        try {
            const productRef = doc(
                db,
                "products",
                editingProduct.id
            );

            await updateDoc(productRef, {
                title: editingProduct.title || "",
                price: Number(editingProduct.price) || 0,
                category: editingProduct.category || "",
                image: editingProduct.image || "",
                updatedAt: new Date(),
            });

            showToast(
                "success",
                "Product updated successfully."
            );

            setEditingProduct(null);

            fetchProducts();
        } catch (error) {
            showToast(
                "error",
                "Update failed: " + error.message
            );
        } finally {
            setSavingEdit(false);
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
                    className={`fixed top-4 right-4 z-[60] flex items-start gap-2 rounded-md border px-4 py-3 text-sm shadow-lg ${
                        toast.type === "success"
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
                            INVENTORY
                        </span>

                        <h1 className="text-lg font-semibold sm:text-xl">
                            Manage Products
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">

                        <Link
                            to="/admin/dashboard"
                            className="rounded-md border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:border-white/40 hover:bg-white/5 active:scale-95"
                        >
                            ← Dashboard
                        </Link>

                        <Link
                            to="/admin/add-product"
                            className="rounded-md bg-[#C9A227] px-4 py-2 text-sm font-semibold text-[#0B1220] transition hover:bg-[#dbb53a] active:scale-95"
                        >
                            + Add product
                        </Link>

                    </div>
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

                ) : products.length === 0 ? (

                    <div className="rounded-lg border border-gray-200 bg-white py-20 text-center">

                        <p className="text-sm text-[#5B6478]">
                            No products yet.
                        </p>

                        <Link
                            to="/admin/add-product"
                            className="mt-3 inline-block text-sm font-medium text-[#0B1220] underline underline-offset-2"
                        >
                            Add your first product
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
                                            Actions
                                        </th>

                                    </tr>

                                </thead>

                                <tbody className="divide-y divide-gray-100">

                                    {products.map((product) => (

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

                                            {/* STOCK */}


                                            {/* ACTIONS */}

                                            <td className="px-4 py-3">

                                                <div className="flex items-center gap-2">

                                                    <button
                                                        onClick={() =>
                                                            handleEditClick(product)
                                                        }
                                                        className="rounded-md border border-gray-300 px-3 py-1.5 text-xs font-semibold text-[#111521] transition hover:border-[#0B1220] hover:bg-[#0B1220] hover:text-white"
                                                    >
                                                        Edit
                                                    </button>

                                                    <button
                                                        onClick={() =>
                                                            handleDelete(product.id)
                                                        }
                                                        disabled={
                                                            deletingId === product.id
                                                        }
                                                        className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                                                    >
                                                        {deletingId === product.id
                                                            ? "..."
                                                            : "Delete"}
                                                    </button>

                                                </div>

                                            </td>

                                        </tr>

                                    ))}

                                </tbody>

                            </table>

                        </div>

                    </div>

                )}

            </div>

            {/* =========================
                EDIT MODAL
            ========================= */}

            {editingProduct && (

                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">

                    <form
                        onSubmit={handleUpdate}
                        className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-lg bg-white p-6 sm:p-8"
                    >

                        <span className="font-mono text-xs tracking-[0.3em] text-[#C9A227]">
                            EDIT
                        </span>

                        <h3 className="mt-1 text-xl font-semibold text-[#111521]">
                            Edit product
                        </h3>

                        <div className="mt-6 space-y-5">

                            {/* TITLE */}

                            <div>

                                <label className="mb-1.5 block text-sm font-medium text-[#111521]">
                                    Product name
                                </label>

                                <input
                                    type="text"
                                    value={editingProduct.title || ""}
                                    onChange={(e) =>
                                        setEditingProduct({
                                            ...editingProduct,
                                            title: e.target.value,
                                        })
                                    }
                                    required
                                    className="w-full rounded-md border border-gray-300 px-3.5 py-2.5 text-sm text-[#111521] transition focus:border-[#0B1220] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/40"
                                />

                            </div>

                            {/* CATEGORY */}

                            <div>

                                <label className="mb-1.5 block text-sm font-medium text-[#111521]">
                                    Category
                                </label>

                                <select
                                    value={editingProduct.category || ""}
                                    onChange={(e) =>
                                        setEditingProduct({
                                            ...editingProduct,
                                            category: e.target.value,
                                        })
                                    }
                                    required
                                    className="w-full rounded-md border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-[#111521] transition focus:border-[#0B1220] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/40"
                                >

                                    <option value="">
                                        Select category
                                    </option>

                                    {categories.map((category) => (
                                        <option
                                            key={category}
                                            value={category}
                                        >
                                            {category}
                                        </option>
                                    ))}

                                </select>

                            </div>

                            {/* PRICE + STOCK */}

                            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">

                                <div>

                                    <label className="mb-1.5 block text-sm font-medium text-[#111521]">
                                        Price (PKR)
                                    </label>

                                    <input
                                        type="number"
                                        min="0"
                                        value={editingProduct.price ?? ""}
                                        onChange={(e) =>
                                            setEditingProduct({
                                                ...editingProduct,
                                                price: e.target.value,
                                            })
                                        }
                                        required
                                        className="w-full rounded-md border border-gray-300 px-3.5 py-2.5 text-sm text-[#111521] transition focus:border-[#0B1220] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/40"
                                    />

                                </div>

                            </div>

                            {/* IMAGE URL */}

                            <div>

                                <label className="mb-1.5 block text-sm font-medium text-[#111521]">
                                    Product image URL
                                </label>

                                <input
                                    type="url"
                                    value={editingProduct.image || ""}
                                    onChange={(e) =>
                                        setEditingProduct({
                                            ...editingProduct,
                                            image: e.target.value,
                                        })
                                    }
                                    required
                                    className="w-full rounded-md border border-gray-300 px-3.5 py-2.5 text-sm text-[#111521] transition focus:border-[#0B1220] focus:outline-none focus:ring-2 focus:ring-[#C9A227]/40"
                                />

                            </div>

                            {/* IMAGE PREVIEW */}

                            {editingProduct.image && (

                                <div className="rounded-lg border border-gray-200 bg-[#FAFAF9] p-4">

                                    <p className="mb-3 text-sm font-medium text-[#111521]">
                                        Image preview
                                    </p>

                                    <img
                                        src={editingProduct.image}
                                        alt="Preview"
                                        className="h-32 w-32 rounded-lg border border-gray-200 object-cover"
                                    />

                                </div>

                            )}

                        </div>

                        {/* BUTTONS */}

                        <div className="mt-8 flex gap-3">

                            <button
                                type="button"
                                onClick={() =>
                                    setEditingProduct(null)
                                }
                                disabled={savingEdit}
                                className="flex-1 rounded-md border border-gray-300 py-2.5 text-sm font-semibold text-[#111521] transition hover:bg-gray-50 disabled:opacity-50"
                            >
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={savingEdit}
                                className="flex-1 rounded-md bg-[#0B1220] py-2.5 text-sm font-semibold text-white transition hover:bg-[#16213D] active:scale-95 disabled:opacity-50"
                            >
                                {savingEdit
                                    ? "Saving..."
                                    : "Save changes"}
                            </button>

                        </div>

                    </form>

                </div>

            )}

        </div>
    );
}

export default ManageProducts;