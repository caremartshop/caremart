import React, { useState } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { ShopProvider, useShop } from './context/ShopContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { BottomNav } from './components/layout/BottomNav';
import { CartDrawer } from './components/cart/CartDrawer';
import { ToastContainer } from './components/common/Toast';

// Pages
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { CategoriesPage } from './pages/CategoriesPage';
import { ProductDetailPage } from './pages/ProductDetailPage';
import { WishlistPage } from './pages/WishlistPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderSuccessPage } from './pages/OrderSuccessPage';
import { OrderTrackingPage } from './pages/OrderTrackingPage';
import { AuthPage } from './pages/AuthPage';
import { ProfilePage } from './pages/ProfilePage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { ContactPage } from './pages/ContactPage';
import { FAQPage } from './pages/FAQPage';
import { PrivacyPolicyPage } from './pages/PrivacyPolicyPage';
import { TermsPage } from './pages/TermsPage';
import { NotFoundPage } from './pages/NotFoundPage';

function MainLayout() {
  const { currentPage } = useShop();
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <HomePage />;
      case 'shop':
        return <ShopPage />;
      case 'categories':
        return <CategoriesPage />;
      case 'product-detail':
        return <ProductDetailPage />;
      case 'wishlist':
        return <WishlistPage />;
      case 'cart':
        return <CartPage />;
      case 'checkout':
        return <CheckoutPage />;
      case 'order-success':
        return <OrderSuccessPage />;
      case 'tracking':
        return <OrderTrackingPage />;
      case 'login':
        return <AuthPage initialMode="login" />;
      case 'register':
        return <AuthPage initialMode="register" />;
      case 'forgot-password':
        return <AuthPage initialMode="forgot-password" />;
      case 'profile':
        return <ProfilePage />;
      case 'admin':
        return <AdminDashboardPage />;
      case 'contact':
        return <ContactPage />;
      case 'faq':
        return <FAQPage />;
      case 'privacy':
        return <PrivacyPolicyPage />;
      case 'terms':
        return <TermsPage />;
      default:
        return <NotFoundPage />;
    }
  };

  if (currentPage === 'admin') {
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-red-600 selection:text-white">
        <AdminDashboardPage />
        <ToastContainer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col justify-between selection:bg-red-600 selection:text-white">
      <div>
        <Header onOpenCart={() => setCartDrawerOpen(true)} />
        <main className="min-h-[calc(100vh-300px)]">
          {renderPage()}
        </main>
      </div>

      <Footer />
      <BottomNav onOpenCart={() => setCartDrawerOpen(true)} />
      <CartDrawer isOpen={cartDrawerOpen} onClose={() => setCartDrawerOpen(false)} />
      <ToastContainer />
    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <ShopProvider>
          <MainLayout />
        </ShopProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
