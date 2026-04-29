
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import AboutSpeakersPage from "./pages/AboutSpeakers";
import AboutEventsPage from "./pages/AboutEvents";
import AboutResidencyPage from "./pages/AboutResidencyPage";
import AboutPartnershipPage from "./pages/AboutPartnershipPage";
import AboutGalleryPage from "./pages/AboutGalleryPage";
import AboutTestimonialsPage from "./pages/AboutTestimonialsPage";
import AboutJoinPage from "./pages/AboutJoinPage";
import { AuthProvider } from "@/contexts/AuthContext";
import { SocialProvider } from "@/contexts/SocialContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SocialProvider>
        <NotificationsProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/about" element={<About />} />
              <Route path="/about/speakers" element={<AboutSpeakersPage />} />
              <Route path="/about/events" element={<AboutEventsPage />} />
              <Route path="/about/residency" element={<AboutResidencyPage />} />
              <Route path="/about/partnership" element={<AboutPartnershipPage />} />
              <Route path="/about/gallery" element={<AboutGalleryPage />} />
              <Route path="/about/testimonials" element={<AboutTestimonialsPage />} />
              <Route path="/about/join" element={<AboutJoinPage />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
        </NotificationsProvider>
      </SocialProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;