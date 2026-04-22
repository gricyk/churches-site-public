window.addEventListener('load', async () => {
  if (!navigator.modelContext) return;

  try {
    await navigator.modelContext.provideContext({
      tools: [
        {
          name: "find_church",
          description: "Найти русскоязычную или украиноязычную евангельскую церковь (ЕХБ) или баптистскую церковь в любой стране мира по названию страны или города. Каталог содержит 450+ церквей в 180+ странах на 6 континентах.",
          inputSchema: {
            type: "object",
            properties: {
              country: {
                type: "string",
                description: "Название страны на русском, например: Германия, Италия, Франция, США, Австралия"
              },
              city: {
                type: "string",
                description: "Название города (опционально), например: Берлин, Прага, Лондон"
              }
            },
            required: ["country"]
          },
          execute: async ({ country, city }) => {
            const query = city ? `${country} ${city}` : country;
            const url = `/search/?q=${encodeURIComponent(query)}`;
            window.location.href = url;
            return { redirected: url };
          }
        },
        {
          name: "get_page_markdown",
          description: "Получить содержимое текущей страницы сайта в формате markdown — без HTML-разметки, только структурированный текст.",
          inputSchema: {
            type: "object",
            properties: {},
            required: []
          },
          execute: async () => {
            const base = window.location.pathname.replace(/\/?$/, '/');
            const mdUrl = base + 'index.md';
            const res = await fetch(mdUrl, { headers: { Accept: 'text/markdown' } });
            if (!res.ok) return { error: 'markdown not available', status: res.status };
            const text = await res.text();
            return { markdown: text, url: window.location.href };
          }
        },
        {
          name: "get_full_catalog",
          description: "Получить полную базу данных всех церквей каталога в структурированном текстовом формате, оптимизированном для AI-систем. Содержит адреса, расписание, контакты по всем 450+ церквям.",
          inputSchema: {
            type: "object",
            properties: {},
            required: []
          },
          execute: async () => {
            const res = await fetch('/llms-full.txt');
            if (!res.ok) return { error: 'catalog not available', status: res.status };
            const text = await res.text();
            return { content: text, url: 'https://spasenie.eu/llms-full.txt' };
          }
        },
        {
          name: "get_site_index",
          description: "Получить краткое описание сайта и структуру каталога из llms.txt — обзор разделов, географии, форматов данных.",
          inputSchema: {
            type: "object",
            properties: {},
            required: []
          },
          execute: async () => {
            const res = await fetch('/llms.txt');
            if (!res.ok) return { error: 'index not available', status: res.status };
            const text = await res.text();
            return { content: text, url: 'https://spasenie.eu/llms.txt' };
          }
        }
      ]
    });
  } catch (e) {
    console.debug('WebMCP not supported:', e);
  }
});
