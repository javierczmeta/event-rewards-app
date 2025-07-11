import '../styles/Badge.css'
import {DynamicIcon} from 'lucide-react/dynamic'

const Badge = ({badge, className}) => {
    return (<div className={className}>
        <DynamicIcon name={badge.icon} className='badge-icon'/>
        <p className='badge-info'>{badge.name}</p>
    </div>)
}

export default Badge;