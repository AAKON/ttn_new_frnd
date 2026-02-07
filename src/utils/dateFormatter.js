import dayjs from "dayjs";

const DateFormatter = ({ publishDate }) => {
  return dayjs(publishDate).format("MMMM DD, YYYY");
};

export const formatDateTime = (date) => {
  if (!date) return "";
  return dayjs(date).format("DD MMM YYYY HH:mm");
};

export default DateFormatter;
