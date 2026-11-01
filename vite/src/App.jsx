import { lazy } from 'react';
import { createBrowserRouter } from 'react-router-dom';

// 🟢 វិធីសាស្ត្រនាំចូល (Import) ដោយសុវត្ថិភាពសម្រាប់ React.lazy
// ប្រសិនបើ Component របស់អ្នកប្រើប្រាស់ export default ស្រាប់៖
const DashboardPage = lazy(() => import('../pages/dashboard'));
const OrdersPage = lazy(() => import('../pages/orders'));
const ReportsPage = lazy(() => import('../pages/reports'));
const ReservationsPage = lazy(() => import('../pages/reservations'));
const SettingsPage = lazy(() => import('../pages/settings'));

// ⚠️ ប៉ុន្តែប្រសិនបើ Component របស់អ្នកប្រើប្រាស់ Named Export (ឧទាហរណ៍ៈ export function OrdersPage()) 
// អ្នកត្រូវសរសេរបន្ថែម .then(m => ({ default: m.ชื่อComponent })) ដូចខាងក្រោម៖
/*
const OrdersPage = lazy(() => import('../pages/orders').then(m => ({ default: m.OrdersPage })));
const SettingsPage = lazy(() => import('../pages/settings').then(m => ({ default: m.SettingsPage })));
*/

const router = createBrowserRouter([
  {
    path: '/',
    element: <DashboardPage />,
  },
  {
    path: '/orders',
    element: <OrdersPage />,
  },
  {
    path: '/reports',
    element: <ReportsPage />,
  },
  {
    path: '/reservations',
    element: <ReservationsPage />,
  },
  {
    path: '/settings',
    element: <SettingsPage />,
  },
]);

export default router;