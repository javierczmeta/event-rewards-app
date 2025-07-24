import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router";
import { UserProvider } from "./contexts/UserContext.jsx";
import { CategoryProvider } from "./contexts/CategoryContext.jsx";
import { FeedProvider } from "./contexts/FeedContext.jsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

const root = document.getElementById("root");

ReactDOM.createRoot(root).render(
    <BrowserRouter>
        <QueryClientProvider client={queryClient}>
            <UserProvider>
                <CategoryProvider>
                    <FeedProvider>
                        <App />
                    </FeedProvider>
                </CategoryProvider>
            </UserProvider>
        </QueryClientProvider>
    </BrowserRouter>
);
