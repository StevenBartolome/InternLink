export const claudeService = {
  async chat(messages, userContext = {}) {
    const response = await fetch('/api/bullbot/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messages,
        userId: userContext.userId,
        userRole: userContext.userRole,
        userName: userContext.userName,
      }),
    });
    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'BullBot is unavailable');
    }
    return response.json(); // { content, links }
  },
};
