interface UrlMetadata {
  title?: string;
  image?: string;
  price?: string;
  currency?: string;
}

export async function fetchUrlMetadata(url: string): Promise<UrlMetadata | null> {
  try {
    new URL(url);
  } catch {
    return null;
  }

  try {
    const response = await fetch(
      `https://api.microlink.io/?url=${encodeURIComponent(url)}&meta=true&audio=false&video=false`
    );

    if (!response.ok) return null;

    const json = await response.json();
    if (!json.data) return null;

    const metadata: UrlMetadata = {};

    if (json.data.title) {
      metadata.title = json.data.title;
    }

    if (json.data.image?.url) {
      metadata.image = json.data.image.url;
    }

    const priceData = json.data.price;
    if (priceData) {
      const priceStr = typeof priceData === 'string' ? priceData : priceData.text;
      if (priceStr) {
        metadata.price = priceStr;
        const match = priceStr.match(/^([^\d]*)?[\d,]+\.?\d*/);
        if (match) {
          const prefix = match[1] || '';
          const symbolMap: Record<string, string> = {
            $: '$',
            '€': '€',
            '£': '£',
            '¥': '¥',
            '₹': '₹',
          };
          for (const [sym, code] of Object.entries(symbolMap)) {
            if (prefix.includes(sym) || priceStr.startsWith(sym)) {
              metadata.currency = code;
              break;
            }
          }
        }
      }
    }

    if (!metadata.currency && json.data.currency) {
      metadata.currency = json.data.currency;
    }

    return Object.keys(metadata).length > 0 ? metadata : null;
  } catch {
    return null;
  }
}
