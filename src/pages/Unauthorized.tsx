export default function UnauthorizedPage() {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold text-red-600">403 - Block Access</h1>
      <p className="mt-4 text-gray-600">User Does not have Access.</p>
      <button
        onClick={() => (window.location.href = "/")}
        className="mt-6 px-4 py-2 bg-primary text-white rounded-md cursor-pointer"
      >
        Back To Dashboard
      </button>
    </div>
  );
}
