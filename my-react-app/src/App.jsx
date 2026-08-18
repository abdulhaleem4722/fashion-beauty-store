import { Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Auth from "./auth/Auth";
import Products from "./pages/Products";
import Cart from "./pages/Cart";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import OrderSuccess from "./pages/OrderSuccess";
import Orders from "./pages/Orders";

import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";
import { useAuth } from "./context/AuthContext";

// ==================== ADMIN ====================

import AdminDashboard from "./admin/pages/AdminDashboard";
import AddProduct from "./admin/pages/AddProduct";
import ManageProducts from "./admin/pages/ManageProducts.jsx";

import AdminLayout from "./admin/pages/Adminlayout.jsx";

function App() {
  const { currentUser } = useAuth();

  return (
    <Routes>

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route
          index
          element={
            <Navigate
              to="dashboard"
              replace
            />
          }
        />
        <Route
          path="dashboard"
          element={<AdminDashboard />}
        />
        <Route
          path="add-product"
          element={<AddProduct />}
        />
        <Route
          path="products"
          element={<ManageProducts />}
        />

      </Route>

      {/* User Window */}

      <Route
        path="*"
        element={
          <div className="min-h-screen bg-gray-50 flex flex-col">

            <Navbar />

            <div className="mx-auto max-w-6xl px-4 py-8 flex-1 w-full">

              <Routes>

                {/* HOME */}
                <Route
                  path="/"
                  element={<Home />}
                />

                {/* LOGIN */}
                <Route path="/login" element={currentUser ? (currentUser.uid === "3FIQWmFn9xTheWDTX8B9GNrakPj1" ? (
                  <Navigate
                    to="/admin/dashboard"
                    replace
                  />
                ) : (
                  <Navigate to="/products" replace
                  />
                )) : (<Auth />)
                }
                />

                {/* PRODUCTS */}
                <Route
                  path="/products"
                  element={<Products />}
                />

                {/* PRODUCT DETAIL */}
                <Route
                  path="/product/:id"
                  element={<ProductDetail />}
                />

                {/* CART */}
                <Route
                  path="/cart"
                  element={
                    <ProtectedRoute>
                      <Cart />
                    </ProtectedRoute>
                  }
                />

                {/* CHECKOUT */}
                <Route
                  path="/checkout"
                  element={
                    <ProtectedRoute>
                      <Checkout />
                    </ProtectedRoute>
                  }
                />

                {/* ORDER SUCCESS */}
                <Route
                  path="/order-success"
                  element={
                    <ProtectedRoute>
                      <OrderSuccess />
                    </ProtectedRoute>
                  }
                />

                {/* ORDERS */}
                <Route
                  path="/orders"
                  element={
                    <ProtectedRoute>
                      <Orders />
                    </ProtectedRoute>
                  }
                />

              </Routes>

            </div>

            <Footer />

          </div>
        }
      />

    </Routes>
  );
}

export default App;