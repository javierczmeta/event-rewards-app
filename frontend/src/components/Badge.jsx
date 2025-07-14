import '../styles/Badge.css'
import {DynamicIcon} from 'lucide-react/dynamic'

const Badge = ({badge, className, onClick, onlyIcons}) => {
    onlyIcons = onlyIcons === true
    className = `${className} ${badge.color}`
    return (<div className={className} onClick={onClick}>
        <DynamicIcon name={badge.icon} className='badge-icon'/>
        {!onlyIcons && <p className='badge-info'>{badge.name}</p>}
    </div>)
}

export default Badge;