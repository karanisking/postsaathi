import PostChip from './Postchip'

export default function CalendarCell({
  day, isToday, isCurrentMonth, posts = [], onDayClick, onPostClick
}) {
  const MAX_VISIBLE = 2
  const visible  = posts.slice(0, MAX_VISIBLE)
  const overflow = posts.length - MAX_VISIBLE

  return (
    <div
      onClick={() => onDayClick?.(day)}
      className={`
        min-h-[80px] sm:min-h-[100px] p-1.5 sm:p-2 rounded-xl border cursor-pointer
        flex flex-col gap-1 transition-all duration-200 group
        ${isCurrentMonth
          ? 'bg-white/[0.02] border-white/5 hover:border-blue-500/20 hover:bg-blue-500/[0.03]'
          : 'bg-transparent border-transparent opacity-40'}
        ${isToday ? 'border-blue-500/40 bg-blue-500/[0.05]' : ''}
      `}
    >
      {/* Day number */}
      <div className="flex items-center justify-between">
        <span className={`
          text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full
          transition-colors
          ${isToday
            ? 'bg-gradient-to-br from-blue-500 to-purple-600 text-white font-bold'
            : isCurrentMonth ? 'text-white/60 group-hover:text-white/80' : 'text-white/20'}
        `}>
          {day.getDate()}
        </span>

        {/* Post count badge */}
        {posts.length > 0 && (
          <span className="text-[9px] text-white/30 font-medium">
            {posts.length}
          </span>
        )}
      </div>

      {/* Post chips */}
      <div className="flex flex-col gap-0.5 flex-1">
        {visible.map((post) => (
          <PostChip key={post._id} post={post} onClick={onPostClick} />
        ))}
        {overflow > 0 && (
          <span className="text-[10px] text-white/30 px-1.5">
            +{overflow} more
          </span>
        )}
      </div>
    </div>
  )
}