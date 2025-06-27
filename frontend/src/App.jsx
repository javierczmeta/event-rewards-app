import Header from "./components/Header";
import Footer from "./components/Footer";
import "./styles/App.css";
import { Routes, Route } from "react-router-dom";
import UserAuthPage from "./components/UserAuthPage";
import Login from "./components/Login";
import Register from "./components/Register";
import WithAuth from "./components/WithAuth";
import RootPage from "./components/RootPage";

function App() {

    let ProtectedRoot = WithAuth(RootPage)
    let ProtectedFeed = WithAuth(<div>Feed</div>)

    return (
        <>
            <Header />
            <Routes>
                <Route path="/" element={<ProtectedRoot/>} />
                <Route element={<UserAuthPage />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Register />} />
                </Route>
                <Route path="/feed" element={<ProtectedFeed/>}/>
            </Routes>
            <Footer />
        </>
    );
}

export default App;
