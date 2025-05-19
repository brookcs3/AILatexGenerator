export async function sendWebhook(url: string, payload: unknown): Promise<void> {
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      console.error(`Webhook POST to ${url} failed with status ${res.status}`);
    }
  } catch (err) {
    console.error(`Error sending webhook to ${url}:`, err);
  }
}
