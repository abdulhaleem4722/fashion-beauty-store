import { useEffect, useState } from "react";
import { auth, db } from "../firebase/firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(
      collection(db, "users", user.uid, "orders"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setOrders(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return <p className="text-gray-500 p-6">Loading your orders...</p>;
  }

  if (orders.length === 0) {
    return (
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-10 text-center">
        <p className="text-gray-500 text-lg">No orders yet 📦</p>
        <p className="text-gray-400 text-sm mt-1">
          Your placed orders will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <h2 className="text-2xl font-semibold text-gray-900">My Orders</h2>

      {orders.map((order) => (
        <div
          key={order.id}
          className="rounded-2xl bg-white shadow-sm border border-gray-100 p-6"
        >
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <p className="text-sm text-gray-500">Order ID</p>
              <p className="font-mono text-sm text-gray-700">{order.id}</p>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                order.status === "Pending"
                  ? "bg-yellow-100 text-yellow-700"
                  : order.status === "Delivered"
                  ? "bg-green-100 text-green-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {order.status}
            </span>
          </div>

          <div className="space-y-3">
            {order.items?.map((item, idx) => (
              <div key={idx} className="flex items-center gap-3">
                <img
                  src={item.image}
                  alt={item.title}
                  className="h-14 w-14 rounded-lg object-cover bg-gray-100"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">{item.title}</p>
                  <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                </div>
                <p className="text-sm font-semibold text-gray-900">
                  Rs. {item.price * item.quantity}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Shipping to: {order.shipping?.city}
            </p>
            <p className="text-lg font-bold text-pink-600">
              Total: Rs. {order.total}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default Orders;