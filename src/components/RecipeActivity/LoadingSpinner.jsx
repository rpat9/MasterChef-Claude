export default function LoadingSpinner({ message = "Loading..." }) {
    return (
      <div className="card text-center p-8">
        <div className="w-12 h-12 border-4 border-[var(--color-secondary)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p>{message}</p>
      </div>
    );
}