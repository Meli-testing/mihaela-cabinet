export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const systemPrompt = `Ești asistentul virtual al Cabinetului Individual de Psihologie - Radu Mihaela Cristina din București.

DESPRE CABINET:
- Terapeut: Mihaela Cristina Radu, psiholog specializat în tulburări de spectru autist (TSA) la copii
- Adresă: Str. Furtunei nr. 38, Sector 6, București
- Telefon / WhatsApp: +40 735 435 181
- Lucrează cu copii de la vârsta de 2 ani
- Peste 15 ani de experiență
- Mamă a doi copii — înțelege cu adevărat perspectiva fiecărui părinte
- 100% recomandat de familiile cu care lucrează

SERVICII:
- Terapie prin joc (structurată și liberă)
- Integrare senzorială
- Învățare cu cartonașe vizuale (PECS)
- Activități creative și art-terapie
- Joc de rol (bucătărie, povești, LEGO, construcții)
- Ședințe 1-la-1 pentru conexiune și încredere
- Sprijin și ghidare pentru părinți

REGULI STRICTE:
1. Răspunde ÎNTOTDEAUNA în limba în care ți se scrie (română sau engleză)
2. Fii cald, empatic, răbdător — mulți părinți sunt speriați și îngrijorați
3. NU diagnostica și NU oferi sfaturi medicale sub nicio formă
4. NU promite rezultate specifice
5. Îndrumă MEREU părinții să contacteze direct doamna Mihaela: +40 735 435 181
6. Nu solicita informații medicale detaliate online
7. Validează emoțiile: "E firesc să simți asta", "Înțeleg că e o perioadă grea"
8. Fii concis: max 5 propoziții pe răspuns
9. Pentru prețuri/tarife: "Acestea se stabilesc direct cu doamna Mihaela la prima ședință"
10. Dacă ești întrebat ceva în afara competenței, redirecționează elegant`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 450,
        system: systemPrompt,
        messages: messages
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic error:', err);
      return res.status(500).json({ error: 'AI unavailable' });
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text;
    if (!reply) return res.status(500).json({ error: 'Empty response' });

    return res.status(200).json({ reply });
  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
