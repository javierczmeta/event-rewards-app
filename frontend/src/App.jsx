import Header from "./components/Header";
import Footer from "./components/Footer";
import "./styles/App.css";
import { Routes, Route } from "react-router-dom";
import UserAuthPage from "./components/UserAuthPage";
import Login from "./components/Login";
import Register from "./components/Register";
import WithAuth from "./components/WithAuth";
import RootPage from "./components/RootPage";
import EventFeed from "./components/EventFeed";
import { useState } from "react";
import { useFormInput } from "./utils/useFormInput";
import CreatePage from "./components/CreatePage";
import MapPage from "./components/MapPage";
import UserPage from "./components/UserPage";
import SchedulePage from "./components/SchedulePage";
import CalendarPage from "./components/CalendarPage";

function App() {

    let ProtectedRoot = WithAuth(RootPage)
    let ProtectedFeed = WithAuth(EventFeed)
    let ProtectedCreate = WithAuth(CreatePage)
    let ProtectedMap = WithAuth(MapPage)
    let ProtectedUser = WithAuth(UserPage)
    let ProtectedSchedule = WithAuth(SchedulePage)
    let ProtectedCalendar = WithAuth(CalendarPage)

    // Search states
    const searchFieldProps = useFormInput("")

    //Sorting states
    const [sortState, setSortState] = useState("")

    const [isRecommending,setIsRecommending] = useState(false)

    return (
        <>
            <Header searchFieldProps={searchFieldProps} sortState={sortState} setSortState={setSortState} setIsRecommending={setIsRecommending} isRecommending={isRecommending}/>
            <Routes>
                <Route path="/*" element={<ProtectedRoot/>} />
                <Route element={<UserAuthPage />}>
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Register />} />
                </Route>
                <Route path="/create" element={<ProtectedCreate/>}/>
                <Route path="/feed/*" element={<ProtectedFeed searchFieldProps={searchFieldProps} sortState={sortState} isRecommending={isRecommending}/>}/>
                <Route path="/map/*" element={<ProtectedMap/>}/>
                <Route path="/schedule/*" element={<ProtectedSchedule/>}/>
                <Route path="/calendar/*" element={<CalendarPage/>}/>
                <Route path="/users/:userId" element={<ProtectedUser/>}/>
            </Routes>
            <Footer />
        </>
    );
}

export default App;
