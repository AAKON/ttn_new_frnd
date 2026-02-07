export const saveRecentlyViewedBlog = (blog) => {
  const maxBlogs = 10;
  const key = "recentlyViewedBlogs";

  let blogs = JSON.parse(localStorage.getItem(key)) || [];
  const blogExists = blogs.some((b) => b.id === blog.id);

  if (!blogExists) {
    blogs.unshift(blog);
  }

  if (blogs.length > maxBlogs) {
    blogs = blogs.slice(0, maxBlogs);
  }

  localStorage.setItem(key, JSON.stringify(blogs));
};
