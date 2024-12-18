import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import UserProvider from './contexts/UserContext';
import { router } from '@/pages/common/router';



function App() {
  return (
    <AuthProvider>
      <UserProvider>
        <RouterProvider router={router}/>
      </UserProvider>
    </AuthProvider>
  );
}

export default App;