import { auth } from '../../firebase/firebase';
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useState } from "react";
import { Zap } from "lucide-react";

function AdminDashboard() {

  const navigate = useNavigate();
  const [logoutError, setLogoutError] = useState(null);

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        navigate("/login");
      })
      .catch((error) => {
        setLogoutError(error.message);
      });
  };

  const actions = [
    {
      to: "/admin/add-product",
      label: "Add product",
      description: "List a new laptop in the store catalog.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
        </svg>
      ),
    },
    {
      to: "/admin/products",
      label: "Manage products",
      description: "Edit pricing, stock, or remove existing listings.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 8l-9-5-9 5 9 5 9-5zM3 8v8l9 5 9-5V8M12 13v8" />
        </svg>
      ),
    },
    {
      to: "/admin/sales",
      label: "Sales",
      description: "Track revenue, orders, and inventory movement.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 19V10M11 19V4M18 19v-7" />
        </svg>
      ),
    },
    {
      to: "/admin/sales-detail",
      label: "Add sales",
      description: "Add sales details to the store catalog.",
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" className="h-5 w-5">
          <Zap />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF9]">

      {/* ===== NAVBAR ===== */}
      <nav className="sticky top-0 z-50 bg-[#0B1220] text-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="min-w-0">
            <span className="font-mono text-[11px] tracking-[0.3em] text-[#C9A227]">
              ADMIN CONSOLE
            </span>
            <h1 className="truncate text-lg font-semibold sm:text-xl">
              FashionBeauty
            </h1>
          </div>

          <button
            onClick={handleLogout}
            className="shrink-0 rounded-md border border-white/20 px-4 py-2 text-sm font-medium text-white transition hover:border-white/40 hover:bg-white/5 active:scale-95"
          >
            Log out
          </button>
        </div>
      </nav>

      {/* ===== MAIN CONTENT ===== */}
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16">

        {logoutError && (
          <div
            role="alert"
            className="mb-8 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            Couldn't log out: {logoutError}
          </div>
        )}

        <span className="font-mono text-xs tracking-[0.3em] text-[#C9A227]">
          OVERVIEW
        </span>
        <h2 className="mt-2 text-2xl font-semibold text-[#111521] sm:text-3xl">
          Dashboard
        </h2>
        <p className="mt-1 text-sm text-[#5B6478]">
          Manage your catalog and keep track of store activity.
        </p>

        {/* ===== ACTION CARDS ===== */}
        <div className="mt-8 grid grid-cols-1 gap-4 sm:mt-10 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {actions.map((action) => (
            <Link key={action.to} to={action.to} className="group block">
              <div className="h-full rounded-lg border border-gray-200 bg-white p-6 transition duration-200 group-hover:-translate-y-0.5 group-hover:border-[#C9A227]/60 group-hover:shadow-md">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-[#0B1220] text-[#C9A227]">
                  {action.icon}
                </div>

                <h3 className="mt-5 text-base font-semibold text-[#111521]">
                  {action.label}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-[#5B6478]">
                  {action.description}
                </p>

                <div className="mt-5 flex items-center gap-1.5 text-sm font-medium text-[#0B1220] transition-transform group-hover:translate-x-1">
                  Open
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                    <path fillRule="evenodd" d="M3 10a.75.75 0 01.75-.75h10.638L11.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 11-1.04-1.08l3.158-2.96H3.75A.75.75 0 013 10z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;