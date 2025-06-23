import "./styles/App.css";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

function App() {
    return (
        <>
            <Router>
                <div>
                    <Switch>
                        <Route path="/">
                            <div>
                                Root Page
                            </div>
                        </Route>
                    </Switch>
                </div>
            </Router>
        </>
    );
}

export default App;
