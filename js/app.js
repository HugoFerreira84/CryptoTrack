document.addEventListener('DOMContentLoaded', () => {
    const marketCards = document.getElementById('marketCards');
    const coinSearch = document.getElementById('coinSearch');

    // Função para criar um novo card
    function createCard(name, symbol, price, change) {
        const colorClasses = 'bg-gradient-to-r from-pink-500 to-purple-500';
        return `
            <div class="${colorClasses} p-6 rounded-lg shadow-lg relative" data-symbol="${symbol}">
                <button class="absolute top-2 right-2 text-white" onclick="removeCard('${symbol}')">✕</button>
                <h3 class="text-xl font-semibold">${name} (${symbol.toUpperCase()})</h3>
                <p class="text-3xl font-bold mt-2">$${price.toFixed(2)}</p>
                <p class="text-md">Variação: ${change.toFixed(2)}%</p>
            </div>
        `;
    }

    // Função para buscar dados de uma moeda específica
    async function fetchCoinData(coinId) {
        try {
            const response = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${coinId}`);
            const data = await response.json();
            if (data.length > 0) {
                const { name, symbol, current_price, price_change_percentage_24h } = data[0];
                const cardHTML = createCard(name, symbol, current_price, price_change_percentage_24h);
                marketCards.insertAdjacentHTML('beforeend', cardHTML);
            } else {
                alert("Moeda não encontrada.");
            }
        } catch (error) {
            console.error("Erro ao buscar dados da moeda:", error);
        }
    }

    // Função para remover um card
    window.removeCard = function (symbol) {
        const card = document.querySelector(`[data-symbol="${symbol}"]`);
        if (card) {
            card.remove();
        }
    };

    // Evento de busca de moeda
    coinSearch.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const coinId = coinSearch.value.trim().toLowerCase();
            if (coinId) {
                fetchCoinData(coinId);
                coinSearch.value = '';
            }
        }
    });
});

// Função `fetchCryptoData` para buscar dados das criptomoedas principais
async function fetchCryptoData() {
    const apiUrl = 'https://api.coincap.io/v2/assets';

    try {
        const response = await fetch(apiUrl);
        if (!response.ok) {
            throw new Error(`Erro: ${response.status}`);
        }
        const data = await response.json();

        // Filtra as criptomoedas desejadas
        const filteredData = data.data.filter(coin =>
            ['bitcoin', 'ethereum', 'polkadot', 'polygon', 'dogecoin', 'solana', 'uniswap'].includes(coin.id)
        );

        return filteredData.map(coin => ({
            symbol: coin.symbol.toUpperCase(),
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


function updateOverviewCards(cryptoData) {
    // Mapear os IDs dos elementos no HTML para cada criptomoeda
    const ids = {
        BTC: { price: '#btcPrice', change: '#btcChange' },
        ETH: { price: '#ethPrice', change: '#ethChange' },
        DOT: { price: '#dotPrice', change: '#dotChange' },
        MATIC: { price: '#maticPrice', change: '#maticChange' },
        DOGE: { price: '#dogePrice', change: '#dogeChange' },
        SOL: { price: '#solPrice', change: '#solChange' },
        UNI: { price: '#uniPrice', change: '#uniChange' }
    };

    // Atualizar cada cartão de criptomoeda
    cryptoData.forEach(coin => {
        if (ids[coin.symbol]) {
            const priceElement = document.querySelector(ids[coin.symbol].price);
            const changeElement = document.querySelector(ids[coin.symbol].change);

            // Verificar se os elementos existem antes de definir o conteúdo
            if (priceElement) {
                priceElement.textContent = `$${coin.price.toFixed(2)}`;
            }
            if (changeElement) {
                changeElement.textContent = `Variação: ${coin.change.toFixed(2)}%`;
            }
        }
    });
}


// Garante que o código seja executado após o carregamento completo do DOM
document.addEventListener('DOMContentLoaded', () => {
    // Acessa o botão de logout
    const logoutButton = document.getElementById('logoutButton');

    // Verifica se o botão de logout existe antes de adicionar o evento
    if (logoutButton) {
        logoutButton.addEventListener('click', function () {
            // Lógica de logout
            alert("Você foi deslogado com sucesso!");
            window.location.href = "index.html";
        });
    }

    // Função para renderizar a tabela de criptomoedas
    function renderTable(cryptoData) {
        const tableBody = document.getElementById('assetTableBody');

        // Verifica se o elemento `tableBody` existe
        if (tableBody) {
            tableBody.innerHTML = '';  // Limpa o conteúdo da tabela

            // Adiciona dados à tabela
            cryptoData.forEach(asset => {
                tableBody.insertAdjacentHTML('beforeend', `
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
    }

    // Função de atualização da dashboard
    async function updateDashboard() {
        const cryptoData = await fetchCryptoData();
        renderTable(cryptoData);  // Agora `renderTable` está definida antes de ser chamada
        // Outras atualizações da dashboard, como gráficos e alertas, podem ser adicionadas aqui
    }

    // Inicia a atualização da dashboard
    updateDashboard();
});



// Configuração dos gráficos das criptomoedas
const cryptoCharts = {
    BTC: { id: 'chartBTC', label: 'Bitcoin', color: '#facc15' },
    ETH: { id: 'chartETH', label: 'Ethereum', color: '#10b981' },
    DOT: { id: 'chartDOT', label: 'Polkadot', color: '#6366f1' },
    MATIC: { id: 'chartMATIC', label: 'Polygon', color: '#f472b6' },
    DOGE: { id: 'chartDOGE', label: 'Dogecoin', color: '#f59e0b' },
    SOL: { id: 'chartSOL', label: 'Solana', color: '#9333ea' },
    UNI: { id: 'chartUNI', label: 'Uniswap', color: '#ec4899' }
};

// Função para inicializar gráficos com verificação para evitar erros
function initializeCharts() {
    Object.keys(cryptoCharts).forEach(symbol => {
        const { id, label, color } = cryptoCharts[symbol];
        const canvas = document.getElementById(id);
        if (canvas) {
            const ctx = canvas.getContext('2d');
            cryptoCharts[symbol].chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: [],
                    datasets: [{
                        label: label,
                        data: [],
                        borderColor: color,
                        backgroundColor: `${color}33`, // Cor com opacidade
                        fill: true,
                        tension: 0.4
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
                                label: function (context) {
                                    return `${context.dataset.label}: $${context.raw.toFixed(2)}`;
                                }
                            }
                        }
                    }
                }
            });
        }
    });
}

// Função para atualizar os gráficos
function updateCharts(cryptoData) {
    const currentTime = new Date().toLocaleTimeString();
    cryptoData.forEach(asset => {
        const chart = cryptoCharts[asset.symbol]?.chart;
        if (chart) {
            chart.data.labels.push(currentTime);
            chart.data.datasets[0].data.push(asset.price);
            if (chart.data.labels.length > 15) {
                chart.data.labels.shift();
                chart.data.datasets[0].data.shift();
            }
            chart.update();
        }
    });
}

// Função checkAlerts para evitar erro
function checkAlerts(data) {
    console.log("Verificando alertas...");
}

// Função para buscar e atualizar a dashboard
async function updateDashboard() {
    const cryptoData = await fetchCryptoData();
    updateOverviewCards(cryptoData);
    renderTable(cryptoData);
    updateCharts(cryptoData);
    checkAlerts(cryptoData);
}

document.addEventListener('DOMContentLoaded', () => {
    const signupButton = document.getElementById('signupButton');
    const loginModal = document.getElementById('loginModal');
    const closeModal = document.getElementById('closeModal');

    // Abre o modal ao clicar no botão de "Cadastrar-se"
    signupButton.addEventListener('click', () => {
        loginModal.classList.remove('hidden');
    });

    // Fecha o modal ao clicar no botão de fechar
    closeModal.addEventListener('click', () => {
        loginModal.classList.add('hidden');
    });

    // Fecha o modal ao clicar fora da caixa de login
    window.addEventListener('click', (event) => {
        if (event.target === loginModal) {
            loginModal.classList.add('hidden');
        }
    });

    // Função para tratar o login
    document.getElementById('loginForm').addEventListener('submit', (event) => {
        event.preventDefault();

        // Captura os valores de username e email
        const username = document.getElementById('username').value;

        // Salva o username no localStorage para mostrar na dashboard
        localStorage.setItem('username', username);

        // Redireciona para a dashboard
        window.location.href = "dashboard.html";
    });
});



// Inicializa os gráficos e atualiza a dashboard
initializeCharts();
updateDashboard();
setInterval(updateDashboard, 60000);
