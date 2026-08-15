import { Link } from "react-router-dom";

function OrderSuccess() {
  return (
    <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-10 text-center max-w-md mx-auto">
      <div className="mx-auto h-16 w-16 rounded-full bg-green-100 flex items-center justify-center text-3xl mb-4">
        ✅
      </div>
      <h2 className="text-2xl font-bold text-gray-900">Order Placed!</h2>
      <p className="text-gray-500 mt-2">
        Thank you for shopping with FashionBeauty. Your order is being processed.
      </p>
      <Link
        to="/products"
        className="mt-6 inline-block rounded-lg bg-pink-600 px-6 py-2.5 text-white font-semibold hover:bg-pink-700 transition"
      >
        Continue Shopping
      </Link>
    </div>
  );
}

export default OrderSuccess;