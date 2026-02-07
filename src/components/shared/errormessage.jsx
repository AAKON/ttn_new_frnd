export default function ErrorMessage({ message = "Something went wrong" }) {
  return (
    <div className="container mx-auto py-16 text-center">
      <p className="text-red-500">{message}</p>
    </div>
  );
}
