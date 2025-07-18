import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router";
import { UserProvider } from "./contexts/UserContext.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
    <BrowserRouter>
        <QueryClientProvider client={queryClient}>
            <UserProvider>
                <App />
            </UserProvider>
        </QueryClientProvider>
    </BrowserRouter>
);
