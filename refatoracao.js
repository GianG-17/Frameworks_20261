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

function formatarRelatorio({ total, totalComImposto, quantidade }) {
  // Criamos um formatador de moeda para o padrão brasileiro (R$)
  const formatarMoeda = (valor) => 
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);

  // Usamos Template Literals para ver o HTML como ele realmente é
  return `
    <section class="relatorio-vendas">
      <h2>Relatório de Vendas</h2>
      <ul>
        <li><strong>Total:</strong> ${formatarMoeda(total)}</li>
        <li><strong>Com impostos:</strong> ${formatarMoeda(totalComImposto)}</li>
        <li><strong>Quantidade:</strong> ${quantidade} itens</li>
      </ul>
    </section>
  `.trim();
}
// Classifica vendedores por performance - Versão Moderna
const classificarVendedores = (vendedores) => {
  return Object.entries(vendedores)
    // 1. Converte o objeto em uma lista de objetos padronizada
    .map(([nome, dados]) => ({
      nome,
      ...dados
    }))
    // 2. Filtra apenas os ativos e loga os inativos
    .filter(vendedor => {
      if (!vendedor.ativo) {
        console.log(`Vendedor inativo: ${vendedor.nome}`);
        return false;
      }
      return true;
    })
    // 3. Ordena do maior para o menor total
    .sort((a, b) => b.total - a.total);
};

// Verifica alertas de meta - Versão Moderna
const verificarAlertas = (metricas, meta) => {
  const percentual = (metricas.total / meta) * 100;
  const metaFormatada = percentual.toFixed(1);
  
  // Criamos os alertas sem alterar o objeto 'metricas' original
  const alertaPrincipal = percentual < LIMITE_ALERTA
    ? { 
        tipo: 'perigo', 
        msg: `Meta em ${metaFormatada}% — abaixo do limite de ${LIMITE_ALERTA}%` 
      }
    : { 
        tipo: 'ok', 
        msg: `Meta atingida: ${metaFormatada}%` 
      };

  return [
    alertaPrincipal,
    { 
      tipo: 'info', 
      msg: `Atualizado em: ${new Date().toLocaleString('pt-BR')}` 
    }
  ];
};