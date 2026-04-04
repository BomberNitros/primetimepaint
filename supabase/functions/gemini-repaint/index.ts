const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders, status: 200 });
  }

  try {
    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      return jsonResponse({ error: 'Server misconfiguration: missing API key.' }, 500);
    }

    const { type, image, prompt } = await req.json();

    if (!type || (type !== 'anatomy' && type !== 'repaint')) {
      return jsonResponse({ error: 'Invalid request type' }, 400);
    }
    if (!image) {
      return jsonResponse({ error: 'Image data is required' }, 400);
    }
    if (type === 'repaint' && !prompt) {
      return jsonResponse({ error: 'Prompt is required for repaint' }, 400);
    }

    const gatewayBase = 'https://ai.gateway.lovable.dev/v1';

    if (type === 'anatomy') {
      const res = await fetch(`${gatewayBase}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [{
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: image } },
              {
                type: 'text',
                text: `You are analysing a physical tabletop miniature to help a painter plan a color scheme. Identify every distinct paintable region on this figure. For each region return:
- region: string (e.g. 'Outer flesh body')
- description: string (surface it covers)
- baseColor: { name: string, hex: string }
- shadowColor: { name: string, hex: string }
- highlightColor: { name: string, hex: string }
- surfaceNote: string (texture and treatment note)

Sample colors only from the miniature figure itself — not from the base, groundwork, background, or any scenic elements. Ignore environmental colors.

Return only a valid JSON array. No prose. No explanation.`
              }
            ]
          }],
          stream: false,
        }),
      });

      if (!res.ok) {
        if (res.status === 429) return jsonResponse({ error: 'Rate limit reached.' }, 429);
        if (res.status === 402) return jsonResponse({ error: 'Billing limit reached.' }, 402);
        return jsonResponse({ error: `Gateway error: ${res.statusText}` }, 500);
      }

      const response = await res.json();
      const raw = response.choices[0].message.content;
      const cleaned = raw
        .replace(/^```(?:json)?\s*/i, '')
        .replace(/\s*```$/, '')
        .trim();
      const regions = JSON.parse(cleaned);
      return jsonResponse({ regions });
    }

    // type === 'repaint'
    const res = await fetch(`${gatewayBase}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [{
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: image } },
            { type: 'text', text: prompt }
          ]
        }],
        modalities: ['image'],
        stream: false,
      }),
    });

    if (!res.ok) {
      if (res.status === 429) return jsonResponse({ error: 'Rate limit reached.' }, 429);
      if (res.status === 402) return jsonResponse({ error: 'Billing limit reached.' }, 402);
      return jsonResponse({ error: `Gateway error: ${res.statusText}` }, 500);
    }

    const response = await res.json();
    const imageUrl = response.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      return jsonResponse({ error: 'Image data not found in gateway response.' }, 500);
    }

    return jsonResponse({ image: imageUrl });

  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error.';
    return jsonResponse({ error: message }, 500);
  }
});
