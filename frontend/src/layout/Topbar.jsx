import { useLocation, Link } from "react-router-dom";

const titles = {
  "/dashboard": "Dashboard",
  "/products": "Products",
  "/customers": "Customers",
  "/orders": "Orders",
  "/orders/new": "New Order",
};

function getPageTitle(pathname) {
  if (pathname.startsWith("/products/") && pathname !== "/products") {
    return "Product Details";
  }
  if (pathname.startsWith("/orders/") && pathname !== "/orders" && pathname !== "/orders/new") {
    return "Order Details";
  }
  return titles[pathname] || "Inventory Manager";
}

export default function Topbar() {
  const { pathname } = useLocation();
  const title = getPageTitle(pathname);

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 gap-3">
      <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">{title}</h1>
      <div className="flex items-center gap-3">
        {pathname === "/products" && (
          <Link to="/products" className="text-sm text-gray-500">
            Manage Products
          </Link>
        )}
        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-sm font-medium">
          A
        </div>
      </div>
    </header>
  );
}
