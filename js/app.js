// Captura todos os links com a classe `smooth-scroll`
document.querySelectorAll('.smooth-scroll').forEach(link => {
    link.addEventListener('click', function(event) {
        event.preventDefault(); // Evita o comportamento padrão do link
        const targetId = this.getAttribute('href').substring(1); // Obtém o ID do alvo (sem #)
        const targetElement = document.getElementById(targetId);

        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop,
                behavior: 'smooth'
            });
        }
    });
});

$(document).ready(function () {
    // Inicializa DataTable
    $('#assetTable').DataTable();

    // Função de atualização da dashboard
    async function updateDashboard() {
        const cryptoData = await fetchCryptoData();

        // Atualiza visão geral, tabela e gráficos
        updateOverviewCards(cryptoData);
        renderTable(cryptoData);
        updateCharts(cryptoData);
        checkAlerts(cryptoData); // Verifica os alertas de preço
    }

    // Atualiza dashboard a cada 60 segundos para evitar limite de requisição
    setInterval(updateDashboard, 60000);
    updateDashboard();

    // Eventos de submissão para alertas e portfólio
    $('#priceAlertForm').submit(handlePriceAlertSubmit);
    $('#portfolioForm').submit(handlePortfolioSubmit);
});

// IDs e cores dos gráficos
const cryptoCharts = {
    BTC: { id: 'chartBTC', label: 'Bitcoin', color: '#facc15' },
    ETH: { id: 'chartETH', label: 'Ethereum', color: '#10b981' },
    DOT: { id: 'chartDOT', label: 'Polkadot', color: '#6366f1' },
    MATIC: { id: 'chartMATIC', label: 'Polygon', color: '#f472b6' },
    DOGE: { id: 'chartDOGE', label: 'Dogecoin', color: '#f59e0b' },
    SOL: { id: 'chartSOL', label: 'Solana', color: '#9333ea' },
    UNI: { id: 'chartUNI', label: 'Uniswap', color: '#ec4899' }
};

// Inicializa gráficos com linhas e cores distintas
function initializeCharts() {
    Object.keys(cryptoCharts).forEach(symbol => {
        const { id, label, color } = cryptoCharts[symbol];
        const ctx = document.getElementById(id).getContext('2d');
        
        cryptoCharts[symbol].chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [],
                datasets: [{
                    label: label,
                    data: [],
                    borderColor: color,
                    backgroundColor: `${color}33`, // Opacidade leve para preenchimento
                    fill: true,
                    tension: 0.4 // Curvatura da linha para suavidade
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    x: {
                        grid: { display: false }
                    },
                    y: {
                        beginAtZero: false,
                        grid: { color: '#374151' }
                    }
                },
                plugins: {
                    legend: { display: true },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: $${context.raw.toFixed(2)}`;
                            }
                        }
                    }
                }
            }
        });
    });
}

// Atualiza os dados dos gráficos com novas informações
function updateCharts(cryptoData) {
    const currentTime = new Date().toLocaleTimeString();

    cryptoData.forEach(asset => {
        if (cryptoCharts[asset.symbol]) {
            const chart = cryptoCharts[asset.symbol].chart;
            chart.data.labels.push(currentTime);
            chart.data.datasets[0].data.push(asset.price);

            // Limita o número de pontos no gráfico
            if (chart.data.labels.length > 15) {
                chart.data.labels.shift();
                chart.data.datasets[0].data.shift();
            }

            chart.update();
        }
    });
}

// Inicializa os gráficos ao carregar a página
initializeCharts();


/** Função para Buscar Dados de Criptomoedas com Proxy para CORS */
async function fetchCryptoData() {
    const apiUrl = 'https://api.coincap.io/v2/assets';

    try {
        const response = await fetch(apiUrl);

        // Verifique se a resposta está ok (código de status 200-299)
        if (!response.ok) {
            throw new Error(`Erro: ${response.status}`);
        }

        const data = await response.json();

        // Filtra as criptomoedas desejadas
        const filteredData = data.data.filter(coin => ['bitcoin', 'ethereum', 'polkadot', 'polygon', 'dogecoin', 'solana', 'uniswap'].includes(coin.id));

        return filteredData.map(coin => ({
            symbol: coin.symbol,
            name: coin.name,
            price: parseFloat(coin.priceUsd),
            change: parseFloat(coin.changePercent24Hr),
            volume: parseFloat(coin.volumeUsd24Hr)
        }));
    } catch (error) {
        console.error("Erro ao buscar dados de criptomoedas:", error);
        return [];
    }
}



/** Atualiza Cartões de Visão Geral */
function updateOverviewCards(cryptoData) {
    const ids = { BTC: '#btc', ETH: '#eth', DOT: '#dot', MATIC: '#matic', DOGE: '#doge', SOL: '#sol', UNI: '#uni' };

    cryptoData.forEach(coin => {
        $(`${ids[coin.symbol]}Price`).text(`$${coin.price.toFixed(2)}`);
        $(`${ids[coin.symbol]}Change`).text(`Variação: ${coin.change.toFixed(2)}%`);
    });
}

/** Renderiza Tabela de Criptomoedas */
function renderTable(cryptoData) {
    const tableBody = $('#assetTableBody');
    tableBody.empty();
    cryptoData.forEach(asset => {
        tableBody.append(`
            <tr>
                <td>${asset.symbol}</td>
                <td>${asset.name}</td>
                <td>$${asset.price.toFixed(2)}</td>
                <td class="${asset.change >= 0 ? 'text-green-500' : 'text-red-500'}">${asset.change.toFixed(2)}%</td>
                <td>${(asset.volume / 1000000).toFixed(1)}M</td>
            </tr>
        `);
    });
}

/** Atualiza Gráficos de Todas as Criptomoedas */
function updateCharts(cryptoData) {
    const currentTime = new Date().toLocaleTimeString();

    cryptoData.forEach(asset => {
        if (charts[asset.symbol]) {
            charts[asset.symbol].data.labels.push(currentTime);
            charts[asset.symbol].data.datasets[0].data.push(asset.price);
            charts[asset.symbol].update();
        }
    });
}
// Lista de alertas de preço
const priceAlerts = [];

// Função para configurar o alerta de preço
function handlePriceAlertSubmit(event) {
    event.preventDefault(); // Evita o envio padrão do formulário
    const symbol = document.getElementById('assetSymbol').value.toUpperCase();
    const targetPrice = parseFloat(document.getElementById('alertPrice').value);

    // Verifica se ambos o símbolo e o preço alvo estão preenchidos
    if (symbol && targetPrice) {
        // Adiciona o alerta à lista de alertas
        priceAlerts.push({ symbol, targetPrice });
        // Adiciona o alerta à interface com estilo aprimorado
        document.getElementById('alertsList').innerHTML += `
            <div class="bg-gray-800 border border-gray-700 rounded-lg p-3 flex justify-between items-center">
                <span class="text-gray-300">Alerta para <span class="font-semibold text-white">${symbol}</span> ao preço de <span class="font-semibold text-green-400">$${targetPrice.toFixed(2)}</span></span>
                <button onclick="removeAlert('${symbol}', ${targetPrice})" class="text-red-500 hover:text-red-400 font-semibold">&times;</button>
            </div>
        `;
    }

    // Limpa os campos do formulário após definir o alerta
    document.getElementById('assetSymbol').value = '';
    document.getElementById('alertPrice').value = '';
}

// Função para remover alerta da lista
function removeAlert(symbol, targetPrice) {
    // Filtra e atualiza a lista de alertas, removendo o alerta específico
    const alertIndex = priceAlerts.findIndex(alert => alert.symbol === symbol && alert.targetPrice === targetPrice);
    if (alertIndex !== -1) {
        priceAlerts.splice(alertIndex, 1);
    }
    // Atualiza a interface
    updateAlertListDisplay();
}

// Função para atualizar a exibição dos alertas
function updateAlertListDisplay() {
    const alertsList = document.getElementById('alertsList');
    alertsList.innerHTML = '';
    priceAlerts.forEach(alert => {
        alertsList.innerHTML += `
            <div class="bg-gray-800 border border-gray-700 rounded-lg p-3 flex justify-between items-center">
                <span class="text-gray-300">Alerta para <span class="font-semibold text-white">${alert.symbol}</span> ao preço de <span class="font-semibold text-green-400">$${alert.targetPrice.toFixed(2)}</span></span>
                <button onclick="removeAlert('${alert.symbol}', ${alert.targetPrice})" class="text-red-500 hover:text-red-400 font-semibold">&times;</button>
            </div>
        `;
    });
}

// Associar a função `handlePriceAlertSubmit` ao evento de envio do formulário
document.getElementById('priceAlertForm').addEventListener('submit', handlePriceAlertSubmit);

// Lista de ativos no portfólio
const portfolio = [];

// Função para adicionar ativo ao portfólio
function handlePortfolioSubmit(event) {
    event.preventDefault();
    const symbol = document.getElementById('portfolioAssetSymbol').value.toUpperCase();
    const quantity = parseFloat(document.getElementById('portfolioQuantity').value);

    if (symbol && quantity) {
        portfolio.push({ symbol, quantity });
        updatePortfolioDisplay();
    }

    // Limpa os campos do formulário
    document.getElementById('portfolioAssetSymbol').value = '';
    document.getElementById('portfolioQuantity').value = '';
}

// Função para exibir e atualizar ativos do portfólio e valor total
function updatePortfolioDisplay() {
    const portfolioList = document.getElementById('portfolioList');
    portfolioList.innerHTML = '';
    let totalValue = 0;

    portfolio.forEach(asset => {
        const price = getPriceBySymbol(asset.symbol); // Busca o preço atual do ativo
        const assetValue = price * asset.quantity;
        totalValue += assetValue;

        // Adiciona o ativo ao portfólio na interface com estilo aprimorado
        portfolioList.innerHTML += `
            <div class="bg-gray-800 border border-gray-700 rounded-lg p-3 flex justify-between items-center">
                <span class="text-gray-300">${asset.symbol} - Quantidade: <span class="font-semibold text-white">${asset.quantity.toFixed(4)}</span> - Valor: <span class="font-semibold text-green-400">$${assetValue.toFixed(2)}</span></span>
                <button onclick="removePortfolioAsset('${asset.symbol}', ${asset.quantity})" class="text-red-500 hover:text-red-400 font-semibold">&times;</button>
            </div>
        `;
    });

    document.getElementById('portfolioTotal').textContent = `Valor Total: $${totalValue.toFixed(2)}`;
}

// Função para remover ativo do portfólio
function removePortfolioAsset(symbol, quantity) {
    const assetIndex = portfolio.findIndex(asset => asset.symbol === symbol && asset.quantity === quantity);
    if (assetIndex !== -1) {
        portfolio.splice(assetIndex, 1);
    }
    // Atualiza a interface
    updatePortfolioDisplay();
}

// Função para obter preço atual pelo símbolo
function getPriceBySymbol(symbol) {
    const allAssets = Object.values(charts).map(chart => ({
        symbol: chart.data.datasets[0].label,
        price: chart.data.datasets[0].data.slice(-1)[0] || 0
    }));
    const asset = allAssets.find(item => item.symbol === symbol);
    return asset ? asset.price : 0;
}

// Associar a função `handlePortfolioSubmit` ao evento de envio do formulário
document.getElementById('portfolioForm').addEventListener('submit', handlePortfolioSubmit);

