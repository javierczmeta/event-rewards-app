const EventImage = ({image, className, alt}) => {
    return (
        <>
        {image ? <img src={image} className={className} alt={alt}></img> : <img src="../event_placeholder.svg" className={className} alt={alt}></img>}
        </>
    )
}

export default EventImage;