import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { db } from "../firebase/firebase";
import { collection, getDocs, limit, query } from "firebase/firestore";

const categories = [
  {
    name: "Makeup",
    image: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=500",
  },
  {
    name: "Skincare",
    image: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500",
  },
  {
    name: "Haircare",
    image: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=500",
  },
];

function Home() {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const q = query(collection(db, "products"), limit(6));
        const snap = await getDocs(q);
        const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setFeatured(list);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeatured();
  }, []);

  return (
    <div className="space-y-10">
      {/* Hero Banner */}
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

      {/* Category Tiles */}
      {/* Category Tiles */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-5">Shop by Category</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <Link
              key={cat.name}
              to={`/products?category=${cat.name}`}
              className="group relative overflow-hidden rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 h-56"
            >
              <img
                src={cat.image}
                alt={cat.name}
                className="absolute inset-0 h-full w-full object-cover group-hover:scale-110 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5 flex items-center justify-between">
                <h3 className="text-white text-xl font-bold">{cat.name}</h3>
                <span className="text-white text-sm font-medium bg-white/20 backdrop-blur-sm rounded-full px-3 py-1 group-hover:bg-pink-600 transition">
                  Shop →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

    
      {/* Featured Products */}
      <section className="rounded-2xl bg-white shadow-sm border border-gray-100 p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-2xl font-semibold text-gray-900">
            Featured Products
          </h2>

          <Link
            to="/products"
            className="text-sm text-pink-600 font-medium hover:underline"
          >
            View All →
          </Link>
        </div>

        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((item) => (
              <Link
                key={item.id}
                to={`/product/${item.id}`}
                className="block"
              >
                <div
                  className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md hover:border-pink-200 transition cursor-pointer"
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    className="h-40 w-full rounded-lg object-cover bg-gray-100"
                  />

                  <h3 className="mt-3 text-base font-semibold text-gray-900">
                    {item.title}
                  </h3>

                  <p className="text-pink-600 font-bold">
                    Rs. {item.price}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default Home;