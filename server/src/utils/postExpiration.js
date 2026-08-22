// Closes a post whose deadline has passed. Only acts on posts that are
// currently "open" with a non-null deadline in the past; cancelled, closed,
// null-deadline, and future-deadline posts are left untouched.
// Returns true if the post was closed, false otherwise.
const closeIfExpired = async (post) => {
  const isExpired = post.status === "open" && post.deadline && post.deadline < new Date();

  if (!isExpired) {
    return false;
  }

  post.status = "closed";
  await post.save();

  return true;
};

module.exports = { closeIfExpired };
