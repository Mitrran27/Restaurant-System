export default function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-7 h-7', lg: 'w-10 h-10' };
  return (
    <div className={`${sizes[size]} border-2 border-brand-200 border-t-brand-500 rounded-full animate-spin ${className}`} />
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Spinner size="lg" />
    </div>
  );
}

export function InlineLoader() {
  return (
    <div className="flex items-center justify-center py-10">
      <Spinner />
    </div>
  );
}
