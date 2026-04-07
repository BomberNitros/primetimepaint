// v3 — reference images with data URI prefix + size filter
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

async function fetchWithRetry(url: string, init: RequestInit, maxRetries = 3): Promise<Response> {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await fetch(url, init);
    if (res.status === 429 && attempt < maxRetries) {
      const delay = Math.pow(2, attempt) * 2000 + Math.random() * 1000;
      await new Promise((r) => setTimeout(r, delay));
      continue;
    }
    return res;
  }
  throw new Error('Unreachable');
}

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

    const { type, image, prompt, referenceImages } = await req.json();

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

    const refParts = Array.isArray(referenceImages) && referenceImages.length > 0
      ? referenceImages
          .filter((r: unknown) => typeof r === 'string' && (r as string).length < 800_000)
          .map((r: string) => ({
            type: 'image_url',
            image_url: {
              url: r.startsWith('data:') ? r : `data:image/jpeg;base64,${r}`
            }
          }))
      : [];

    if (type === 'anatomy') {
      const anatomyPrompt = `You are a master miniature painter planning a vibrant, exciting color scheme for an unpainted figure. The miniature is currently primed grey — the grey you see is primer, NOT the intended paint scheme. DO NOT describe the grey primer color. PROPOSE the colors you would RECOMMEND painting each distinct region, as a professional painter creating an interesting scheme from scratch.

Identify every paintable region on the figure only — ignore the base, groundwork, and background.

For each region PROPOSE:
- region: string (e.g. 'Scales', 'Wing Membrane')
- description: string (what surface this covers)
- baseColor: { name: string, hex: string }
  Your recommended mid-tone base coat.
  Use rich, saturated colors — not grey.
- shadowColor: { name: string, hex: string }
  A darker, cooler shade for recesses.
- highlightColor: { name: string, hex: string }
  A lighter, warmer tone for raised surfaces.
- surfaceNote: string (texture and technique note)

Color theory guidance:
- Vary hue across regions for visual interest
- Use warm highlights on cool bases and vice versa
- Consider complementary accent colors
- Bold choices are better than safe grey-adjacent ones

Return only a valid JSON array. No prose. No explanation. No markdown.`;

      const content: unknown[] = [
        ...refParts,
        { type: 'image_url', image_url: { url: image } },
        { type: 'text', text: anatomyPrompt
          + (refParts.length > 0
            ? '\n\nREFERENCE IMAGES PROVIDED ABOVE: Extract their palette, mood, contrast level, and technique. Apply what you learn to your color recommendations.'
            : '') }
      ];

      const res = await fetchWithRetry(`${gatewayBase}/chat/completions`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [{ role: 'user', content }],
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
    const content: unknown[] = [
      { type: 'image_url', image_url: { url: image } },
      ...refParts,
      { type: 'text', text: prompt
        + (refParts.length > 0
          ? '\n\nREFERENCE IMAGES PROVIDED ABOVE: Match their palette, contrast level, brushwork character, and atmosphere in the repaint.'
          : '') }
    ];

    const res = await fetchWithRetry(`${gatewayBase}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3.1-flash-image-preview',
        messages: [{ role: 'user', content }],
        generationConfig: { responseModalities: ['TEXT', 'IMAGE'] },
        stream: false,
      }),
    });

    if (!res.ok) {
      if (res.status === 429) return jsonResponse({ error: 'Rate limit reached.' }, 429);
      if (res.status === 402) return jsonResponse({ error: 'Billing limit reached.' }, 402);
      return jsonResponse({ error: `Gateway error: ${res.statusText}` }, 500);
    }

    const response = await res.json();
    const msg = response.choices?.[0]?.message;

    let imageData: string | undefined;

    // Format 1: images array
    imageData = msg?.images?.[0]?.image_url?.url;

    // Format 2: content array with image parts
    if (!imageData && Array.isArray(msg?.content)) {
      for (const part of msg.content) {
        if ((part.type === 'image_url' || part.type === 'image') && part.image_url?.url) {
          imageData = part.image_url.url;
          break;
        }
        if (part.inline_data?.data) {
          const mime = part.inline_data.mime_type || 'image/png';
          imageData = `data:${mime};base64,${part.inline_data.data}`;
          break;
        }
      }
    }

    // Format 3: direct base64 string in content
    if (!imageData && typeof msg?.content === 'string' && msg.content.startsWith('data:image')) {
      imageData = msg.content;
    }

    if (!imageData) {
      return jsonResponse({ error: 'Image data not found in gateway response.' }, 500);
    }

    return jsonResponse({ image: imageData });

  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : 'Unknown error.';
    return jsonResponse({ error: message }, 500);
  }
});
