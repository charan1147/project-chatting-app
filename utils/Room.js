export const getRoomId = (user1, user2) => {
  return [String(user1), String(user2)].sort().join("_");
};
