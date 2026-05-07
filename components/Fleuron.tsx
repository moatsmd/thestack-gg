export function Fleuron({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center justify-center my-6 ${className}`}>
      <span className="fleuron">✦</span>
    </div>
  )
}

export function GoldRule({ className = '' }: { className?: string }) {
  return <span className={`gold-rule block ${className}`} />
}
