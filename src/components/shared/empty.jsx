export const Empty = ({ message = "No data found." }) => {
  return (
    <div className="flex items-center justify-center py-12">
      <p className="text-gray-500 text-sm">{message}</p>
    </div>
  );
};
