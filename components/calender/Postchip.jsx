import { Twitter, Linkedin } from 'lucide-react'

const statusColors = {
  scheduled:  'bg-yellow-500/10 border-yellow-500/30 text-yellow-300',
  published:  'bg-green-500/10  border-green-500/30  text-green-300',
  failed:     'bg-red-500/10    border-red-500/30    text-red-300',
  draft:      'bg-white/5       border-white/10      text-white/40',
  publishing: 'bg-blue-500/10   border-blue-500/30   text-blue-300',
}

const platformIcons = {
  twitter:  <Twitter  size={10} className="shrink-0" />,
  linkedin: <Linkedin size={10} className="shrink-0" />,
}

export default function PostChip({ post, onClick }) {
  const colorClass = statusColors[post.status] || statusColors.draft

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick?.(post) }}
      className={`w-full text-left px-1.5 py-0.5 rounded-md border text-[10px] font-medium
        flex items-center gap-1 truncate transition-all hover:scale-[1.02] ${colorClass}`}
    >
      {/* Platform icons */}
      <span className="flex items-center gap-0.5 shrink-0">
        {post.platforms?.map((p) => (
          <span key={p}>{platformIcons[p]}</span>
        ))}
      </span>
      {/* Caption preview */}
      <span className="truncate">{post.caption || 'No caption'}</span>
    </button>
  )
}