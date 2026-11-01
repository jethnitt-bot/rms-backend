import { lazy } from 'react';

// project imports
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';
import ProtectedRoute from './protectedRoute';

// render - Dashboard
const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/default')));

// render - color / component overview
const Color = Loadable(lazy(() => import('pages/component-overview/color')));
const Typography = Loadable(lazy(() => import('pages/component-overview/typography')));
const Shadow = Loadable(lazy(() => import('pages/component-overview/shadows')));

// render - sample page
const SamplePage = Loadable(lazy(() => import('pages/extra-pages/sample-page')));

// 🟢 Import App Pages
const UserManagement = Loadable(lazy(() => import('pages/userManagement')));
const Categories = Loadable(lazy(() => import('pages/categories')));
const MenuPage = Loadable(lazy(() => import('pages/menu')));
const TablesPage = Loadable(lazy(() => import('pages/tables')));

const ReservationsPage = Loadable(lazy(() => import('pages/reservations')));
const OrdersPage = Loadable(lazy(() => import('pages/orders')));
const KitchenPage = Loadable(lazy(() => import('pages/kitchen')));
const BillingPage = Loadable(lazy(() => import('pages/billing')));
const InventoryPage = Loadable(lazy(() => import('pages/inventory')));
const SuppliersPage = Loadable(lazy(() => import('pages/suppliers')));
const ReportsPage = Loadable(lazy(() => import('pages/reports')));
const SettingsPage = Loadable(lazy(() => import('pages/settings')));
const Logout = Loadable(lazy(() => import('pages/logout')));

// ============================== MAIN ROUTING ============================== //

const MainRoutes = {
  path: '/',
  element: <ProtectedRoute />,
  children: [
    {
      path: '/',
      element: <DashboardLayout />,
      children: [
        {
          path: '/',
          element: <DashboardDefault />
        },
        {
          path: 'dashboard',
          children: [
            {
              path: 'default',
              element: <DashboardDefault />
            }
          ]
        },
        {
          path: 'typography',
          element: <Typography />
        },
        {
          path: 'color',
          element: <Color />
        },
        {
          path: 'shadow',
          element: <Shadow />
        },
        {
          path: 'sample-page',
          element: <SamplePage />
        },
        {
          path: 'users',
          element: <UserManagement />
        },
        {
          path: 'categories',
          element: <Categories />
        },
        {
          path: 'menu',
          element: <MenuPage />
        },
        {
          path: 'tables',
          element: <TablesPage />
        },

        {
          path: 'reservations',
          element: <ReservationsPage />
        },
        {
          path: 'orders',
          element: <OrdersPage />
        },
        {
          path: 'kitchen',
          element: <KitchenPage />
        },
        {
          path: 'billing',
          element: <BillingPage />
        },
        {
          path: 'inventory',
          element: <InventoryPage />
        },
        {
          path: 'suppliers',
          element: <SuppliersPage />
        },
        {
          path: 'reports',
          element: <ReportsPage />
        },
        {
          path: 'settings',
          element: <SettingsPage />
        },
        {
          path: 'logout',
          element: <Logout />
        }
      ]
    }
  ]
};

export default MainRoutes;
