import HabitacionCard from '../../molecules/HabitacionCard/HabitacionCard.jsx'
import EmptyState from '../../atoms/EmptyState/EmptyState.jsx'

export default function HabitacionesGrid({
  habitaciones,
  recomendaciones,
  onEdit,
  onDelete,
  onView,
  loading = false,
}) {
  if (loading) {
    return (
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div key={index} className="card animate-pulse px-5 py-5">
            <div className="h-3 w-24 rounded-full bg-border" />
            <div className="mt-4 h-6 w-32 rounded-full bg-border" />
            <div className="mt-3 h-3 w-full rounded-full bg-border" />
            <div className="mt-6 h-10 w-24 rounded-full bg-border" />
          </div>
        ))}
      </section>
    )
  }

  if (habitaciones.length === 0) {
    return (
      <EmptyState
        title="Sin habitaciones"
        description="Crea tu primera habitacion para empezar a gestionar el arriendo."
      />
    )
  }

  return (
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {habitaciones.map((habitacion) => {
        const recomendacion = recomendaciones.find(
          (item) => item.habitacionId === habitacion.id,
        )?.recomendacion

        return (
          <HabitacionCard
            key={habitacion.id}
            habitacion={habitacion}
            recomendacion={recomendacion}
            onEdit={onEdit}
            onDelete={onDelete}
            onView={onView}
          />
        )
      })}
    </section>
  )
}
