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
    const hasRefs = Array.isArray(referenceImages) && referenceImages.length > 0;

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

Return only a valid JSON array. No prose. No explanation. No markdown.` +
        (hasRefs
          ? '\n\nREFERENCE IMAGES PROVIDED ABOVE:\nThese show painted miniatures or color references.\nExtract their palette, mood, contrast level, and technique. Apply what you learn to your color recommendations.'
          : '');

      const content: unknown[] = [];
      if (hasRefs) {
        for (const ref of referenceImages) {
          content.push({ type: 'image_url', image_url: { url: ref } });
        }
      }
      content.push({ type: 'image_url', image_url: { url: image } });
      content.push({ type: 'text', text: anatomyPrompt });

      const res = await fetch(`${gatewayBase}/chat/completions`, {
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
    const repaintPrompt = prompt +
      (hasRefs
        ? '\n\nREFERENCE IMAGES PROVIDED ABOVE:\nMatch their palette, contrast level, brushwork character, and atmosphere in the repaint.'
        : '');

    const content: unknown[] = [
      { type: 'image_url', image_url: { url: image } },
    ];
    if (hasRefs) {
      for (const ref of referenceImages) {
        content.push({ type: 'image_url', image_url: { url: ref } });
      }
    }
    content.push({ type: 'text', text: repaintPrompt });

    const res = await fetch(`${gatewayBase}/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [{ role: 'user', content }],
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
