import { Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Header from './components/Header.jsx';
import Footer from './components/Footer.jsx';
import MobileActionBar from './components/MobileActionBar.jsx';
import ScrollManager from './components/ScrollManager.jsx';
import Home from './pages/Home.jsx';
import Book from './pages/Book.jsx';
import Checkout from './pages/Checkout.jsx';
import Confirmation from './pages/Confirmation.jsx';
import NotFound from './pages/NotFound.jsx';

const FLOW_ROUTES = ['/book', '/checkout', '/confirmation'];

export default function App() {
  const { pathname } = useLocation();
  const inFlow = FLOW_ROUTES.some((r) => pathname.startsWith(r));

  return (
    <>
      <ScrollManager />
      <Header compact={inFlow} />
      <main className={inFlow ? 'main main--flow' : 'main'}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/book" element={<Book />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!inFlow && <Footer />}
      {!inFlow && <MobileActionBar />}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: '#16171A',
            color: '#E7E7EA',
            border: '1px solid #2B2D32',
            fontFamily: 'Figtree, sans-serif',
          },
          success: { iconTheme: { primary: '#D40A0F', secondary: '#fff' } },
        }}
      />
    </>
  );
}
