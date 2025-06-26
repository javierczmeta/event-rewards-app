import { useUser } from "../contexts/UserContext";

const RootPage = () => {
    const {user} = useUser()

    return (<div>
        <h2>Welcome {user.username}</h2>
    </div>)
}

export default RootPage;
