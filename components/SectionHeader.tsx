interface SectionHeaderProps {
  label: string;
  title: string;
}

export default function SectionHeader({ label, title }: SectionHeaderProps) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-indigo-600 mb-2">
        {label}
      </p>
      <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">{title}</h2>
    </div>
  );
}
