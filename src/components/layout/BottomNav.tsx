import React from 'react';
import { 
  Home, 
  LayoutGrid, 
  ShoppingCart, 
  ClipboardList, 
  User 
} from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface BottomNavProps {
  onOpenCart: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ onOpenCart }) => {
  const { currentPage, navigateTo, cart } = useShop();
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const cartItemsCount = cart.reduce((total, item) => total + item.quantity, 0);

  const navItems = [
    {
      id: 'home',
      label: t('nav.home', 'Home'),
      icon: Home,
      isActive: currentPage === 'home',
      onClick: () => navigateTo('home')
    },
    {
      id: 'categories',
      label: t('nav.categories', 'Categories'),
      icon: LayoutGrid,
      isActive: currentPage === 'categories',
      onClick: () => navigateTo('categories')
    },
    {
      id: 'cart',
      label: t('nav.cart', 'Cart'),
      icon: ShoppingCart,
      badge: cartItemsCount > 0 ? cartItemsCount : undefined,
      isActive: currentPage === 'cart',
      onClick: () => onOpenCart()
    },
    {
      id: 'orders',
      label: t('nav.orders', 'Orders'),
      icon: ClipboardList,
      isActive: currentPage === 'tracking' || currentPage === 'order-success',
      onClick: () => navigateTo('tracking')
    },
    {
      id: 'account',
      label: t('nav.account', 'Account'),
      icon: User,
      isActive: currentPage === 'profile' || currentPage === 'login' || currentPage === 'register',
      onClick: () => {
        if (currentUser) {
          navigateTo('profile');
        } else {
          navigateTo('login');
        }
      }
    }
  ];

  return (
    <nav 
      aria-label="Mobile Navigation Bar"
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] md:hidden safe-area-pb"
    >
      <div className="max-w-md mx-auto px-2 py-1.5 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.isActive;

          return (
            <button
              key={item.id}
              onClick={item.onClick}
              type="button"
              className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-2xl transition-all duration-200 cursor-pointer active:scale-92 ${
                active 
                  ? 'text-red-600 font-extrabold' 
                  : 'text-slate-500 hover:text-slate-800 font-semibold'
              }`}
            >
              {/* Icon Container with Badge */}
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${active ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'}`} />
                {typeof item.badge === 'number' && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center shadow-xs border-2 border-white animate-in zoom-in duration-150">
                    {item.badge > 99 ? '99+' : item.badge}
                  </span>
                )}
              </div>

              {/* Label */}
              <span className={`text-[10px] tracking-tight mt-1 transition-colors ${
                active ? 'text-red-600 font-bold' : 'text-slate-500'
              }`}>
                {item.label}
              </span>

              {/* Subtle active indicator dot */}
              {active && (
                <span className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-red-600" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
