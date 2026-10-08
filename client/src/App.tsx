import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Entrance from "./pages/Entrance";

// Language pages are code-split so the first paint only downloads what's needed.
const EnglishHome = lazy(() => import("./pages/EnglishHome"));
const ArabicHome = lazy(() => import("./pages/ArabicHome"));
const UrduHome = lazy(() => import("./pages/UrduHome"));
const Home = lazy(() => import("./pages/Home"));
const ResearchPage = lazy(() => import("./pages/ResearchPage"));

function RouteLoader() {
  return (
    <div
      aria-hidden="true"
      style={{
        minHeight: "60vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          width: 34,
          height: 34,
          borderRadius: "50%",
          border: "3px solid rgba(21, 87, 176, 0.2)",
          borderTopColor: "#1557b0",
          animation: "splash-spin 0.9s linear infinite",
        }}
      />
    </div>
  );
}

function Router() {
  return (
    <Suspense fallback={<RouteLoader />}>
      <Switch>
        <Route path={"/"} component={Entrance} />
        <Route path={"/ta"} component={Home} />
        <Route path={"/en"} component={EnglishHome} />
        <Route path={"/ar"} component={ArabicHome} />
        <Route path={"/ur"} component={UrduHome} />
        <Route path={"/research"} component={ResearchPage} />
        <Route path={"/404"} component={NotFound} />
        {/* Final fallback route */}
        <Route component={NotFound} />
      </Switch>
    </Suspense>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="light"
        // switchable
      >
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
