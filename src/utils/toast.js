export const showSuccessToast = (toast, message, options = {}) => {
  const displayMessage =
    typeof message === "object" && message !== null
      ? "Submitted successfully!"
      : message || "Submitted successfully!";

  toast({
    title: "Success",
    description: displayMessage,
    variant: "success",
    ...options,
  });
};

export const showErrorToast = (toast, message, options = {}) => {
  const displayMessage =
    typeof message === "object" && message !== null
      ? "Request failed!"
      : message || "Request failed!";

  toast({
    title: "Error",
    description: displayMessage,
    variant: "destructive",
    ...options,
  });
};
