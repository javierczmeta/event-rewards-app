

const UserImage = ({image, className, alt, onClick}) => {
    return (
        <>
        {image ? <img src={image} className={className} alt={alt} onClick={onClick}></img> : <img src="../pfp_placeholder.jpg" className={className} alt={alt} onClick={onClick}></img>}
        </>
    )
}

export default UserImage;