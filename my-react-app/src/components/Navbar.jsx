import { Link, useNavigate, useLocation } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebase/firebase";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { collection, onSnapshot } from "firebase/firestore";

function Navbar() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [cartCount, setCartCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    setSearchTerm(params.get("search") || "");
  }, [location]);

  useEffect(() => {
    if (!currentUser) {
      setCartCount(0);
      return;
    }

    const cartRef = collection(db, "users", currentUser.uid, "cart");
    const unsubscribe = onSnapshot(cartRef, (snapshot) => {
      const totalQty = snapshot.docs.reduce(
        (sum, doc) => sum + Number(doc.data().quantity || 1),
        0
      );
      setCartCount(totalQty);
    });

    return () => unsubscribe();
  }, [currentUser]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate("/products");
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="bg-white shadow-sm border-b sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3">
          {/* Top row: logo + icons */}
          <div className="flex items-center justify-between gap-3">
            <Link
              to="/"
              className="text-xl sm:text-2xl font-extrabold text-pink-600 shrink-0 tracking-tight"
            >
              A to Z Cosmetics
            </Link>

            {/* Desktop search - hidden on mobile */}
            <form
              onSubmit={handleSearch}
              className="hidden md:block flex-1 max-w-md mx-4"
            >
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                  🔍
                </span>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search for products, brands..."
                  className="w-full rounded-full border border-gray-200 bg-gray-50 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 focus:bg-white transition"
                />
              </div>
            </form>

            {/* Desktop links */}
            <div className="hidden md:flex items-center gap-5">
              <Link to="/" className="text-sm font-medium text-gray-600 hover:text-pink-600 transition">
                Home
              </Link>
              <Link to="/products" className="text-sm font-medium text-gray-600 hover:text-pink-600 transition">
                Shop
              </Link>

              {currentUser ? (
                <>
                  

                  <Link to="/cart" className="relative text-gray-600 hover:text-pink-600 transition">
                    <span className="text-xl">🛒</span>
                    {cartCount > 0 && (
                      <span className="absolute -top-1.5 -right-2 bg-pink-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                        {cartCount}
                      </span>
                    )}
                  </Link>

                  <div className="h-8 w-8 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 text-sm font-bold">
                    {currentUser.email.charAt(0).toUpperCase()}
                  </div>

                  <button
                    onClick={handleLogout}
                    className="bg-pink-600 text-white text-sm font-semibold px-4 py-2 rounded-full hover:bg-pink-700 transition"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="bg-pink-600 text-white text-sm font-semibold px-5 py-2 rounded-full hover:bg-pink-700 transition"
                >
                  Login
                </Link>
              )}
            </div>
          </div>

          {/* Mobile search - always visible below logo row */}
          <form onSubmit={handleSearch} className="mt-3 md:hidden">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                🔍
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search products..."
                className="w-full rounded-full border border-gray-200 bg-gray-50 pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500"
              />
            </div>
          </form>
        </div>
      </nav>

      {/* ===== MOBILE BOTTOM NAVIGATION ===== */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.05)]">
        <div className="grid grid-cols-4">

          <Link
            to="/"
            className={`flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium transition ${
              isActive("/") ? "text-pink-600" : "text-gray-500"
            }`}
          >
            <span className="text-lg">🏠</span>
            Home
          </Link>

          <Link
            to="/products"
            className={`flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium transition ${
              isActive("/products") ? "text-pink-600" : "text-gray-500"
            }`}
          >
            <span className="text-lg">🛍️</span>
            Products
          </Link>

          <Link
            to={currentUser ? "/cart" : "/login"}
            className={`relative flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium transition ${
              isActive("/cart") ? "text-pink-600" : "text-gray-500"
            }`}
          >
            <span className="relative text-lg">
              🛒
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-2.5 bg-pink-600 text-white text-[9px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </span>
            Cart
          </Link>

         

          {currentUser ? (
            <button
              onClick={handleLogout}
              className="flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium text-gray-500 transition"
            >
              <div className="h-5 w-5 rounded-full bg-pink-100 flex items-center justify-center text-pink-600 text-[10px] font-bold">
                {currentUser.email.charAt(0).toUpperCase()}
              </div>
              Logout
            </button>
          ) : (
            <Link
              to="/login"
              className={`flex flex-col items-center justify-center gap-0.5 py-2.5 text-[11px] font-medium transition ${
                isActive("/login") ? "text-pink-600" : "text-gray-500"
              }`}
            >
              <span className="text-lg">👤</span>
              Login
            </Link>
          )}

        </div>
      </div>
    </>
  );
}

export default Navbar;