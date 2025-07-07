

const UserImage = ({image, className, alt}) => {
    return (
        <>
        {image ? <img src={image} className={className} alt={alt}></img> : <img src="../pfp_placeholder.jpg" className={className} alt={alt}></img>}
        </>
    )
}

export default UserImage;