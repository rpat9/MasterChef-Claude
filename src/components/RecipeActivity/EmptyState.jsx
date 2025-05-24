export default function EmptyState() {
    return (
      <div className="card text-center p-8">
        <p className="mb-4">You haven't saved any recipes yet.</p>
        <a href="/" className="btn-primary btn-hover inline-block">
          Create a new recipe
        </a>
      </div>
    );
}