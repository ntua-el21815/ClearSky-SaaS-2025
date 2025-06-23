export default function Unauthorized() {
  return (
    <div className="p-12 text-center">
      <h1 className="text-3xl font-bold text-red-600">Unauthorized</h1>
      <p className="mt-4 text-gray-500">You do not have permission to access this page.</p>
    </div>
  );
}