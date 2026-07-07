// ==========================================
// 🔄 CONFIGURAÇÃO E INICIALIZAÇÃO DO FIREBASE
// ==========================================
const firebaseConfig = {
    databaseURL: "https://internato-mafunda-default-rtdb.firebaseio.com/"
};

// Inicialização utilizando a biblioteca de compatibilidade global
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// Referência da tabela de livros na nuvem
const dbRefLivros = database.ref('livrosDidaticos');

// Array Global para armazenamento dos registros
let listaDeLivros = [];

// Elementos capturados do DOM
const openModalBtn = document.getElementById('openModalBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const modalOverlay = document.getElementById('modalOverlay');
const bookForm = document.getElementById('bookForm');
const booksTableBody = document.getElementById('booksTableBody');

// ==========================================
// 🔄 SINCRONIZAÇÃO EM TEMPO REAL (FIREBASE)
// ==========================================
dbRefLivros.on('value', (snapshot) => {
    const dados = snapshot.val();
    if (dados) {
        listaDeLivros = Object.keys(dados).map(key => ({
            id_firebase: key,
            ...dados[key]
        }));
    } else {
        listaDeLivros = [];
    }
    renderizarTabela();
});

// ==========================================
// 🖥️ RENDERIZAÇÃO DA INTERFACE (UI)
// ==========================================
// Encontre essa função no seu javascript.js e substitua por esta:
function renderizarTabela() {
    if (!booksTableBody) return;

    if (listaDeLivros.length === 0) {
        booksTableBody.innerHTML = `<tr><td colspan="3" style="color:#64748b; text-align:center;">Nenhum livro disponível no momento</td></tr>`;
        return;
    }

    booksTableBody.innerHTML = listaDeLivros.map(livro => {
        // Encodifica o link e o título para enviar via URL de forma segura
        const linkParam = encodeURIComponent(livro.linkDrive || '');
        const tituloParam = encodeURIComponent(livro.nome || 'Livro');
        
        // Agora o link aponta para o seu leitor.html com as variáveis
        const urlLeitor = `leitor.html?link=${linkParam}&titulo=${tituloParam}`;

        return `
            <tr>
                <td><b>${livro.nome || 'Sem título'}</b></td>
                <td>${livro.autor || 'Desconhecido'}</td>
                <td>
                    <a href="${urlLeitor}" class="btn-view">Ler livro</a>
                </td>
            </tr>
        `;
    }).join('');
}
// ==========================================
// 🖱️ GERENCIAMENTO DOS EVENTOS DA TELA
// ==========================================
function fecharEResetarModal() {
    if (modalOverlay) modalOverlay.classList.remove('active');
    if (bookForm) bookForm.reset();
}

// Escuta o clique do botão de adicionar
if (openModalBtn) {
    openModalBtn.onclick = function() {
        if (modalOverlay) {
            modalOverlay.classList.add('active');
            const inputNome = document.getElementById('bookName');
            if (inputNome) inputNome.focus();
        }
    };
}

// Escuta o botão de fechar/cancelar
if (closeModalBtn) {
    closeModalBtn.onclick = fecharEResetarModal;
}

// Envia os dados para o Firebase quando o usuário clica em salvar
if (bookForm) {
    bookForm.onsubmit = function(e) {
        e.preventDefault();

        const nomeLivro = document.getElementById('bookName').value;
        const autorLivro = document.getElementById('bookAuthor').value;
        const linkDrive = document.getElementById('driveLink').value;

        const novoLivro = {
            nome: nomeLivro,
            autor: autorLivro,
            linkDrive: linkDrive
        };

        // Salva os dados na nuvem sob o nó 'livrosDidaticos'
        dbRefLivros.push(novoLivro);

        fecharEResetarModal();
    };
}