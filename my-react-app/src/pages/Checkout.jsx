import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase/firebase";
import {
  collection,
  onSnapshot,
  addDoc,
  serverTimestamp,
  deleteDoc,
  doc,
  writeBatch,
} from "firebase/firestore";

function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
  });

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) return;

    const cartRef = collection(db, "users", user.uid, "cart");
    const unsubscribe = onSnapshot(cartRef, (snapshot) => {
      const items = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      setCartItems(items);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const total = cartItems.reduce(
    (sum, item) => sum + Number(item.price || 0) * Number(item.quantity || 1),
    0
  );

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) {
      alert("Please login first");
      return;
    }

    if (cartItems.length === 0) {
      alert("Your cart is empty");
      return;
    }

    setPlacing(true);

    try {
      // 1) Order Firestore mein save karo
      await addDoc(collection(db, "users", user.uid, "orders"), {
        items: cartItems.map((item) => ({
          productId: item.productId || item.id,
          title: item.title,
          price: item.price,
          image: item.image,
          quantity: item.quantity || 1,
        })),
        total,
        shipping: form,
        status: "Pending",
        createdAt: serverTimestamp(),
      });

      // 2) Cart clear karo (batch delete)
      const batch = writeBatch(db);
      cartItems.forEach((item) => {
        const ref = doc(db, "users", user.uid, "cart", item.id);
        batch.delete(ref);
      });
      await batch.commit();

      navigate("/order-success");
    } catch (error) {
      alert(error.message);
    } finally {
      setPlacing(false);
    }
  };

  if (loading) {
    return <p className="text-gray-500 p-6">Loading checkout...</p>;
  }

  if (cartItems.length === 0) {
    return (
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-10 text-center">
        <p className="text-gray-500 text-lg">Your cart is empty 🛍️</p>
        <p className="text-gray-400 text-sm mt-1">Add some products before checkout.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Shipping Form */}
      <form
        onSubmit={handlePlaceOrder}
        className="lg:col-span-2 rounded-2xl bg-white shadow-sm border border-gray-100 p-6 space-y-4"
      >
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">
          Shipping Details
        </h2>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            name="fullName"
            value={form.fullName}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone Number
          </label>
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address
          </label>
          <textarea
            name="address"
            value={form.address}
            onChange={handleChange}
            required
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            City
          </label>
          <input
            type="text"
            name="city"
            value={form.city}
            onChange={handleChange}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
          />
        </div>

        <div className="rounded-lg bg-pink-50 border border-pink-200 px-4 py-3 text-sm text-pink-700">
          💵 Payment Method: Cash on Delivery
        </div>

        <button
          type="submit"
          disabled={placing}
          className="w-full rounded-xl bg-pink-600 py-3 text-white font-semibold hover:bg-pink-700 transition disabled:opacity-60"
        >
          {placing ? "Placing Order..." : "Place Order"}
        </button>
      </form>

      {/* Order Summary */}
      <div className="rounded-2xl bg-white shadow-sm border border-gray-100 p-6 h-fit">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Order Summary</h2>

        <div className="space-y-3 max-h-80 overflow-y-auto">
          {cartItems.map((item) => (
            <div key={item.id} className="flex items-center gap-3">
              <img
                src={item.image}
                alt={item.title}
                className="h-14 w-14 rounded-lg object-cover bg-gray-100"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{item.title}</p>
                <p className="text-xs text-gray-500">Qty: {item.quantity || 1}</p>
              </div>
              <p className="text-sm font-semibold text-gray-900">
                Rs. {Number(item.price) * Number(item.quantity || 1)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-4 border-t border-gray-200 flex items-center justify-between">
          <p className="text-gray-600 font-medium">Total</p>
          <p className="text-xl font-bold text-pink-600">Rs. {total}</p>
        </div>
      </div>
    </div>
  );
}

export default Checkout;