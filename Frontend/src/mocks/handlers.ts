import { http, HttpResponse } from 'msw';

export const handlers = [
  // Auth
  http.post('/api/auth/login', () => {
    return HttpResponse.json({
      user: { id: '1', email: 'admin@example.com' },
      message: 'Success',
    });
  }),
  http.post('/api/auth/logout', () => {
    return new HttpResponse(null, { status: 200 });
  }),
  http.get('/api/auth/me', () => {
    return HttpResponse.json({ id: '1', email: 'admin@example.com' });
  }),

  // Models
  http.get('/api/models', () => {
    return HttpResponse.json([
      { name: 'llama3:8b', is_pulled: true, size_bytes: 4700000000, pulled_at: new Date().toISOString(), last_used: new Date().toISOString() },
      { name: 'llama3:8b-instruct', is_pulled: false, size_bytes: null, pulled_at: null, last_used: null },
      { name: 'mistral:7b', is_pulled: true, size_bytes: 4100000000, pulled_at: new Date(Date.now() - 86400000).toISOString(), last_used: new Date().toISOString() },
      { name: 'gemma:2b', is_pulled: false, size_bytes: null, pulled_at: null, last_used: null },
    ]);
  }),
  http.post('/api/models/pull', async () => {
    // Return a mocked EventSource URL but we'll cheat to avoid actual SSE complexity for now
    // Since MSW 2.0 has streaming support, but typical SSE EventSource can't easily be intercepted
    return HttpResponse.json({ progress_url: '/api/models/pull/mock/progress' });
  }),
  // Note: True SSE interception is tough with pure msw for EventSource API since it hits browser network closely,
  // we would usually mock the browser EventSource object if strictly needed.

  // Usage
  http.get('/api/usage/summary', () => {
    return HttpResponse.json({
      total_tokens: 1250482,
      total_requests: 342,
      tokens_today: 45032,
      requests_today: 18,
      top_model: 'llama3:8b',
    });
  }),
  http.get('/api/usage/by-day', ({ request }: any) => {
    const url = new URL(request.url);
    const days = Number(url.searchParams.get('days')) || 7;
    const data = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      data.push({
        date: d.toISOString().split('T')[0],
        tokens: Math.floor(Math.random() * 50000) + 10000,
        requests: Math.floor(Math.random() * 50) + 10,
      });
    }
    return HttpResponse.json(data);
  }),
  http.get('/api/usage/by-model', () => {
    return HttpResponse.json([
      { model_name: 'llama3:8b', tokens: 850000, requests: 200 },
      { model_name: 'mistral:7b', tokens: 350000, requests: 120 },
      { model_name: 'llama2:7b', tokens: 50482, requests: 22 },
    ]);
  }),

  // Keys
  http.get('/api/keys', () => {
    return HttpResponse.json([
      { id: 'key1', key_prefix: 'sk-abc12', model_name: 'llama3:8b', label: 'My App', is_active: true, created_at: new Date(Date.now() - 864000000).toISOString(), last_used: new Date().toISOString() },
      { id: 'key2', key_prefix: 'sk-xyz89', model_name: 'mistral:7b', label: 'CLI Tool', is_active: false, created_at: new Date(Date.now() - 1864000000).toISOString(), last_used: new Date(Date.now() - 500000000).toISOString() },
    ]);
  }),
  http.post('/api/keys', async ({ request }: any) => {
    const payload = await request.json() as any;
    return HttpResponse.json({
      api_key: {
        id: `key${Date.now()}`,
        key_prefix: 'sk-new99',
        model_name: payload.model_name,
        label: payload.label || null,
        is_active: true,
        created_at: new Date().toISOString(),
        last_used: null,
      },
      plain_key: 'sk-new99xxxxxxxxxxxxxxxxxxxxxxxxxxxx',
    });
  }),
  http.delete('/api/keys/:id', () => {
    return new HttpResponse(null, { status: 204 });
  }),
  http.patch('/api/keys/:id', async ({ request, params }: any) => {
    const { id } = params;
    const { label } = await request.json() as any;
    return HttpResponse.json({
      id: id as string,
      key_prefix: 'sk-patched',
      model_name: 'llama3:8b',
      label,
      is_active: true,
      created_at: new Date().toISOString(),
      last_used: new Date().toISOString(),
    });
  }),
];
