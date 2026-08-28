import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../firebase/firebase";
import { collection, getDocs, orderBy, query, where } from "firebase/firestore";

function HeroBanner() {
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const fetchDeals = async () => {
      try {
        const q = query(
          collection(db, "products"),
          where("isFlashDeal", "==", true),
          orderBy("order", "asc")
        );
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setDeals(list);
      } catch (error) {
        console.error("Error fetching flash deals:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDeals();
  }, []);

  useEffect(() => {
    if (deals.length <= 1) return;
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % deals.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [deals]);

  if (loading) {
    return (
      <section className="rounded-2xl bg-gradient-to-r from-pink-600 to-rose-500 px-8 py-16 text-center text-white shadow-sm h-64 animate-pulse" />
    );
  }

  if (deals.length === 0) {
    return (
      <section className="rounded-2xl bg-gradient-to-r from-pink-600 to-rose-500 px-8 py-16 text-center text-white shadow-sm">
        <h1 className="text-3xl md:text-5xl font-extrabold">
          Beauty & Fashion, Delivered
        </h1>
        <p className="mt-3 text-white/90 max-w-xl mx-auto">
          Discover makeup, skincare & haircare essentials curated just for you.
        </p>
        <Link
          to="/products"
          className="mt-6 inline-block rounded-full bg-white px-8 py-3 font-semibold text-pink-600 hover:bg-gray-100 transition-colors"
        >
          Shop Now
        </Link>
      </section>
    );
  }

  const deal = deals[current];

  return (
    <section className="relative overflow-hidden rounded-2xl shadow-sm h-64 md:h-80">
      <img
        src={deal.image}
        alt={deal.title || "Flash deal"}
        className="absolute inset-0 h-full w-full object-cover"
      />

      <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />

      <div className="relative z-10 flex h-full flex-col justify-center px-6 md:px-10 max-w-lg">
        {deal.badgeText && (
          <span className="mb-3 inline-block w-fit rounded-full bg-pink-600 px-3 py-1 text-xs font-bold text-white">
            {deal.badgeText}
          </span>
        )}

        {deal.title && (
          <h1 className="text-2xl md:text-4xl font-extrabold text-white leading-tight">
            {deal.title}
          </h1>
        )}

        {deal.subtitle && (
          <p className="mt-2 text-white/90 text-sm md:text-base">
            {deal.subtitle}
          </p>
        )}

        <Link
          to={`/product/${deal.id}`}
          className="mt-5 inline-block w-fit rounded-full bg-white px-6 py-2.5 font-semibold text-pink-600 hover:bg-gray-100 transition-colors text-sm md:text-base"
        >
          Shop Now →
        </Link>
      </div>

      {deals.length > 1 && (
        <div className="absolute bottom-4 right-4 z-10 flex gap-2">
          {deals.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`h-2 rounded-full transition-all ${
                index === current ? "w-6 bg-white" : "w-2 bg-white/50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export default HeroBanner;