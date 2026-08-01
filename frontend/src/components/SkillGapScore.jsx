export default function SkillGapScore({ score }) {
  return (
    <div className="bg-mint rounded-xl p-8 text-center">
      <p className="text-xs uppercase tracking-wide text-teal">Role fit</p>
      <p className="text-5xl font-bold text-teal mt-2">{score || 'N/A'}</p>
    </div>
  )
}
