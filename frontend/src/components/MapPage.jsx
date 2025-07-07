import GeneralMap from "./GeneralMap";
import "../styles/MapPage.css"
import { useState } from "react";

const MapPage = () => {
    return (<main className="map-main">
        <div></div>
        <GeneralMap className="page-map"/>
    </main>)
}

export default MapPage;