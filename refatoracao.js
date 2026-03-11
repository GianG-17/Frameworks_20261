const BASE_URL = 'https://api.empresa.com';
const TAXA_IMPOSTO = 0.15;

/**
 * Busca dados do dashboard de forma assíncrona
 * @param {string} periodo 
 * @returns {Promise<Object>}
 */
async function carregarDashboard(periodo) {
  const url = `${BASE_URL}/metricas?periodo=${periodo}`;

  try {
    const resposta = await fetch(url);
    if (!resposta.ok) throw new Error('Falha na requisição');
    
    const { vendas } = await resposta.json();

    // 1. Filtramos apenas as aprovadas
    const vendasAprovadas = vendas.filter(v => v.status === 'aprovada');

    // 2. Calculamos o total usando reduce
    const totalVendas = vendasAprovadas.reduce((acc, venda) => acc + venda.valor, 0);

    // 3. Retornamos o objeto estruturado
    return {
      total: totalVendas,
      quantidade: vendasAprovadas.length,
      itens: vendasAprovadas,
      totalComImposto: totalVendas * (1 + TAXA_IMPOSTO)
    };

  } catch (erro) {
    console.error("Erro ao carregar dashboard:", erro);
    throw erro; // Lança o erro para quem chamou a função tratar
  }
}