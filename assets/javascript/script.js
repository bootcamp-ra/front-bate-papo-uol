let mensagens = [];
let participantes = [];
let nome;
let destinatario = "Todos";
let tipoMensagem = "message";

perguntarNome();

function perguntarNome() {
  nome = prompt("Digite seu lindo nome");
  registrarParticipante();
}

function registrarParticipante() {
  const dados = { name: nome };
  const requisicao = axios.post("http://localhost:4000/participants", dados);
  requisicao.then(entrarNaSala).catch(perguntarNome);
}

function entrarNaSala() {
  carregarMensagens();
  carregarParticipantes();
  
  agendarAtualizacaoDeMensagens();
  agendarAtualizacaoDeParticipantes();
  agendarAtualizacaoDeStatus();
}

function carregarMensagens() {
  const requisicao = axios.get("http://localhost:4000/messages?limit=50", {
    headers: {
      User: nome
    }
  });
  requisicao.then(processarMensagens);
}

function carregarParticipantes() {
  const requisicao = axios.get("http://localhost:4000/participants", {
    headers: {
      User: nome
    }
  });
  requisicao.then(processarParticipantes);
}

function agendarAtualizacaoDeMensagens() {
  setInterval(carregarMensagens, 3000);
}

function agendarAtualizacaoDeParticipantes() {
  setInterval(carregarParticipantes, 10000);
}

function agendarAtualizacaoDeStatus() {
  setInterval(atualizarStatus, 5000);
}

function atualizarStatus() {
  axios.post("http://localhost:4000/status", {}, {
    headers: {
      User: nome
    }
  });
}

function processarMensagens(resposta) {
  mensagens = [];

  for (let i = 0; i < resposta.data.length; i++) {
    const mensagem = resposta.data[i];
    mensagens.push(mensagem);
  }

  renderizarMensagens();
}

function processarParticipantes(resposta) {
  participantes = resposta.data;

  const todos = { name: "Todos" };
  participantes.unshift(todos);

  renderizarParticipantes();
}

function enviarMensagem() {
  const input = document.querySelector(".input-mensagem");
  const texto = input.value;
  input.value = "";

  if(texto === "") return;
   
  const dados = {
    to: destinatario,
    text: texto,
    type: tipoMensagem
  };

  mensagens.push({
    from: nome,
    ...dados
  });
  renderizarMensagens();

  const requisicao = axios.post("http://localhost:4000/messages", dados, {
    headers: {
      User: nome
    }
  });

  requisicao.catch(atualizarPagina);
}

function atualizarPagina() {
  window.location.reload();
}

function toggleParticipantes() {
  const menu = document.querySelector(".menu");
  const fundo = document.querySelector(".menu-fundo");

  menu.classList.toggle('escondido');
  fundo.classList.toggle('fundo-escondido');
}

function trocarDestinatario(elemento) {
  const span = elemento.querySelector(".nome");
  destinatario = span.innerText;
  renderizarParticipantes();
  atualizarEnviando();
}

function trocarVisibilidade(visibilidade) {
  const liPublico = document.querySelector(".visibilidade-publico");
  const liPrivado = document.querySelector(".visibilidade-privado");

  if (visibilidade === 'publico') {
    tipoMensagem = "message";
    liPublico.classList.add('selecionado');
    liPrivado.classList.remove('selecionado');
  } else {
    tipoMensagem = "private_message";
    liPublico.classList.remove('selecionado');
    liPrivado.classList.add('selecionado');
  }

  atualizarEnviando();
}

function atualizarEnviando() {
  const elemento = document.querySelector(".enviando");

  elemento.innerText = "Enviando para " + destinatario;

  if(tipoMensagem === "private_message") {
    elemento.innerText += " (reservadamente)";
  }
}



// Renders


const classesMensagens = {
  status: 'entrada-saida',
  private_message: 'conversa-privada',
  message: 'conversa-publica'
};

function renderizarMensagens() {
  const ul = document.querySelector(".mensagens-container");
  let html = "";

  for (let i = 0; i < mensagens.length; i++) {
    const mensagem = mensagens[i];

    html += `
      <li class="${classesMensagens[mensagem.type]}">
        ${
          mensagem.time !== undefined
           ? `<span class="horario">(${mensagem.time})</span>`
           : ``
        }

        <span>
          <strong>${mensagem.from}</strong>
        </span>

        ${
          mensagem.type === "private_message"
           ? `<span> reservadamente para </span>`
           : `<span> para </span>`
        }

        <strong>${mensagem.to}</strong>
        <span>${mensagem.text}</span>
      </li>
    `;
  }

  ul.innerHTML = html;

  setTimeout(() => document.querySelector(".mensagens-container li:last-child").scrollIntoView(), 0);
}

function renderizarParticipantes() {
  const ul = document.querySelector(".contatos");

  let html = "";

  for (let i = 0; i < participantes.length; i++) {
    const participante = participantes[i];

    html += `
      <li onclick="trocarDestinatario(this)" class="${participante.name === destinatario ? "selecionado" : ""}">
        ${
          participante.name === "Todos"
           ? `<ion-icon name='people-sharp'></ion-icon>`
           : `<ion-icon name='person-circle'></ion-icon>`
        }

        <span class="nome">${participante.name}</span>
        <ion-icon class='check' name='checkmark-outline'></ion-icon>
      </li>
    `;
  }

  ul.innerHTML = html;
}