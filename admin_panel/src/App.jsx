import { RouterProvider } from 'react-router-dom';

// project imports
import router from 'routes';
import ThemeCustomization from 'themes';

import ScrollTop from 'components/ScrollTop';

import { AdminAuthProvider } from 'contexts/AdminAuthContext';
import { Toaster } from 'react-hot-toast';

// ==============================|| APP - THEME, ROUTER, LOCAL ||============================== //

export default function App() {
  return (
    <ThemeCustomization>
      <Toaster position="top-right" reverseOrder={false} />
      <AdminAuthProvider>
        <ScrollTop>
          <RouterProvider router={router} />
        </ScrollTop>
      </AdminAuthProvider>
    </ThemeCustomization>
  );
}
