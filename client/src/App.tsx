import { lazy, Suspense, useEffect } from "react";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useLocation } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { FormModalProvider } from "./contexts/FormModalContext";
import { trackPageView } from "@/lib/conversion";
import Home from "./pages/Home";

const Services = lazy(() => import("./pages/Services"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Training = lazy(() => import("./pages/Training"));
const Products = lazy(() => import("./pages/Products"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const AdminFiles = lazy(() => import("./pages/AdminFiles"));
const Certifications = lazy(() => import("./pages/Certifications"));
const AdminCertifications = lazy(() => import("./pages/AdminCertifications"));
const Toaster = lazy(() =>
  import("@/components/ui/sonner").then(module => ({ default: module.Toaster })),
);

function PageLoader() {
  return (
    <div className="min-h-screen bg-[#F5F7FA] pt-32">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="h-2 w-32 rounded bg-[#1E90FF]" />
        <div className="mt-8 h-8 w-full max-w-md rounded bg-slate-200" />
        <div className="mt-4 h-4 w-full max-w-2xl rounded bg-slate-200" />
      </div>
    </div>
  );
}

function LazyPage({ children }: { children: React.ReactNode }) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

function ScrollToTop() {
  const [location] = useLocation();

  useEffect(() => {
    if (window.location.hash) return;

    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, [location]);

  return null;
}

function AdminRedirect() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    setLocation("/admin/certifications");
  }, [setLocation]);

  return null;
}

function Router() {
  const [location] = useLocation();

  // Track page views on route changes (GA4 + Meta Pixel)
  useEffect(() => {
    trackPageView(location);
  }, [location]);

  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/services">
        <LazyPage>
          <Services />
        </LazyPage>
      </Route>
      <Route path="/about">
        <LazyPage>
          <About />
        </LazyPage>
      </Route>
      <Route path="/training">
        <LazyPage>
          <Training />
        </LazyPage>
      </Route>
      <Route path="/products">
        <LazyPage>
          <Products />
        </LazyPage>
      </Route>
      <Route path="/portfolio">
        <LazyPage>
          <Portfolio />
        </LazyPage>
      </Route>
      <Route path="/blog">
        <LazyPage>
          <Blog />
        </LazyPage>
      </Route>
      <Route path="/blog/:slug">
        <LazyPage>
          <BlogPost />
        </LazyPage>
      </Route>
      <Route path="/certifications">
        <LazyPage>
          <Certifications />
        </LazyPage>
      </Route>
      <Route path="/contact">
        <LazyPage>
          <Contact />
        </LazyPage>
      </Route>
      <Route path="/admin/files">
        <LazyPage>
          <AdminFiles />
        </LazyPage>
      </Route>
      <Route path="/admin" component={AdminRedirect} />
      <Route path="/admin/certifications">
        <LazyPage>
          <AdminCertifications />
        </LazyPage>
      </Route>
      <Route path="/404" component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <FormModalProvider>
          <Suspense fallback={null}>
            <Toaster />
          </Suspense>
          <ScrollToTop />
          <Router />
        </FormModalProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
