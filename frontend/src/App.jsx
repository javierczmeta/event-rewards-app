import Header from "./components/Header";
import Footer from "./components/Footer";
import "./styles/App.css";
import { Routes, Route } from "react-router-dom";
import UserAuthPage from "./components/UserAuthPage";
import Login from "./components/Login";
import Register from "./components/Register";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient()

function App() {
    return (
        <>
            <QueryClientProvider client={queryClient}>
                <Header />
                <Routes>
                    <Route path="/" element={<div>Root Page</div>} />
                    <Route element={<UserAuthPage />}>
                        <Route path="/login" element={<Login />} />
                        <Route path="/signup" element={<Register />} />
                    </Route>
                </Routes>
                <Footer />
            </QueryClientProvider>
        </>
    );
}

export default App;
