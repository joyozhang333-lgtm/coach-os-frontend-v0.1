import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Marketplace from "./pages/Marketplace";
import Chat from "./pages/Chat";
import Studio from "./pages/Studio";
import Insights from "./pages/Insights";
import Profile from "./pages/Profile";
import CounselorOnboard from "./pages/CounselorOnboard";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/app" component={Dashboard} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/chat" component={Chat} />
      <Route path="/chat/:coachId" component={Chat} />
      <Route path="/studio" component={Studio} />
      <Route path="/insights" component={Insights} />
      <Route path="/profile" component={Profile} />
      <Route path="/counselor-onboard" component={CounselorOnboard} />
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "oklch(0.16 0.005 260)",
                border: "1px solid oklch(1 0 0 / 8%)",
                color: "oklch(0.93 0.005 260)",
              },
            }}
          />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
