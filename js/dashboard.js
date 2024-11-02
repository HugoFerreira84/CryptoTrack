document.addEventListener('DOMContentLoaded', () => {
    const usernameDisplay = document.getElementById('usernameDisplay');
    const logoutButton = document.getElementById('logoutButton');

    // Obtém o username do localStorage e exibe na dashboard
    const username = localStorage.getItem('username');
    if (username) {
        usernameDisplay.textContent = `Bem-vindo, ${username}`;
    } else {
        // Se o usuário não estiver logado, redireciona para a página de login
        window.location.href = "index.html";
    }

    // Função de logout
    logoutButton.addEventListener('click', () => {
        // Remove o username do localStorage
        localStorage.removeItem('username');
        
        // Redireciona para a página de login
        window.location.href = "index.html";
    });
});
