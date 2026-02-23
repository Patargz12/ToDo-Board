export const Spinner = ({ className = "w-5 h-5" }: { className?: string }) => {
  return (
    <div
      className={`${className} border-2 border-current border-t-transparent rounded-full animate-spin`}
      role="status"
      aria-label="Loading"
    />
  );
};
