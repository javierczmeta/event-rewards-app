import ContentLoader from "react-content-loader";

const LoaderEvent = (props) => (
    <div className="event-card loading">
        <ContentLoader
            speed={2}
            width="100%"
            height='210px'
            backgroundColor="#f3f3f3"
            foregroundColor="#ecebeb"
            {...props}
        >
            <rect x="0" y="0" rx="8" ry="8" width="205" height="205" />
            <rect x="230" y="0" rx="0" ry="0" width="180" height="42" />
            <rect x="230" y="50" rx="0" ry="0" width="115" height="20" />
            <rect x="230" y="78" rx="0" ry="0" width="180" height="16" />
            <rect x="230" y="100" rx="0" ry="0" width="180" height="16" />
            <rect x="230" y="132" rx="0" ry="0" width="46" height="16" />
            <rect x="230" y="160" rx="0" ry="0" width="115" height="16" />
            <rect x="450" y="0" rx="0" ry="0" width="250" height="30" />
            <rect x="450" y="39" rx="0" ry="0" width="390" height="250" />
        </ContentLoader>
    </div>
);

export default LoaderEvent;
