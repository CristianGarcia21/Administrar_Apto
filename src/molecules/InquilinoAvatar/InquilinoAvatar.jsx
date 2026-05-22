import Avatar from '../../atoms/Avatar/Avatar.jsx'
import Badge from '../../atoms/Badge/Badge.jsx'

export default function InquilinoAvatar({ nombre, habitacion, moraDias, color }) {
  return (
    <div className="flex items-center gap-3">
      <Avatar name={nombre} color={color} />
      <div>
        <p className="text-sm font-semibold text-textMain">{nombre}</p>
        <p className="text-xs text-textMuted">{habitacion}</p>
        {moraDias > 0 && (
          <div className="mt-1">
            <Badge label={`${moraDias} dias mora`} tone="danger" />
          </div>
        )}
      </div>
    </div>
  )
}
