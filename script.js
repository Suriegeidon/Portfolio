"use strict";
const ENDPOINT = null;
const ATRASO_DEMO_MS = 1500;

const form = document.getElementById("form-contato");
const campos = {
    nome: document.getElementById("nome"),
    email: document.getElementById("email"),
    mensagem: document.getElementById("mensagem"),
};
const botao = document.getElementById("btn-enviar");
const status = document.getElementById("status-form");
const textoBotao = botao.textContent;

let estado = "edicao";

/* ---------- Envio (real ou simulado) ---------- */

function enviarDemo(dados, resultado) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (resultado === "falha") {
                reject(new Error("Falha simulada pelo controle de teste."));
            } else {
                resolve({ ok: true, simulado: true });
            }
        }, ATRASO_DEMO_MS);
    });
}

async function enviarReal(dados) {
    const resposta = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(dados),
    });
    if (!resposta.ok) {
        throw new Error("O serviço respondeu com erro " + resposta.status);
    }
    return { ok: true, simulado: false };
}

function enviarMensagem(dados) {
    if (ENDPOINT) return enviarReal(dados);
    const resultado = form.elements.resultado.value; // escolhido no controle de teste
    return enviarDemo(dados, resultado);
}

/* ---------- Validação ---------- */

function validar() {
    const erros = {};
    const nome = campos.nome.value.trim();
    const email = campos.email.value.trim();
    const mensagem = campos.mensagem.value.trim();

    if (nome.length < 2) erros.nome = "Informe seu nome (mínimo de 2 caracteres).";
    if (!email) erros.email = "Informe seu e-mail.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) erros.email = "Digite um e-mail válido, como nome@exemplo.com.";
    if (mensagem.length < 10) erros.mensagem = "Escreva uma mensagem com pelo menos 10 caracteres.";

    return erros;
}

function mostrarErros(erros) {
    for (const nome of Object.keys(campos)) {
        const campo = campos[nome];
        const caixa = document.getElementById("erro-" + nome);
        if (erros[nome]) {
            caixa.textContent = erros[nome];
            caixa.hidden = false;
            campo.setAttribute("aria-invalid", "true");
        } else {
            caixa.textContent = "";
            caixa.hidden = true;
            campo.removeAttribute("aria-invalid");
        }
    }
}

/* ---------- Estados visuais ---------- */

function definirStatus(tipo, texto) {
    status.className = "status" + (tipo ? " " + tipo : "");
    status.textContent = texto;
}

function bloquear(bloqueado) {
    // aria-disabled (em vez de disabled) mantém o foco no botão para leitores de tela
    botao.setAttribute("aria-disabled", String(bloqueado));
    form.setAttribute("aria-busy", String(bloqueado));
    botao.textContent = bloqueado ? "Enviando…" : textoBotao;
    for (const r of form.elements.resultado) r.disabled = bloqueado;
    for (const campo of Object.values(campos)) campo.readOnly = bloqueado;
}

/* ---------- Fluxo principal ---------- */

form.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    // Trava contra cliques/Enter repetidos: só um processamento por vez.
    if (estado === "processando") return;

    const erros = validar();
    if (Object.keys(erros).length > 0) {
        estado = "erro-validacao";
        mostrarErros(erros);
        const n = Object.keys(erros).length;
        definirStatus("erro", n === 1
            ? "Corrija 1 campo para continuar."
            : "Corrija " + n + " campos para continuar.");
        campos[Object.keys(erros)[0]].focus();
        return;
    }
    mostrarErros({});

    const dados = {
        nome: campos.nome.value.trim(),
        email: campos.email.value.trim(),
        mensagem: campos.mensagem.value.trim(),
    };

    estado = "processando";
    bloquear(true);
    definirStatus("processando", "Enviando sua mensagem… aguarde.");

    try {
        const resultado = await enviarMensagem(dados);
        estado = "sucesso";
        form.reset(); // limpa só depois da confirmação
        definirStatus("sucesso", resultado.simulado
            ? "Envio simulado concluído com sucesso. Nenhum e-mail foi enviado: isto é apenas uma demonstração."
            : "Mensagem enviada com sucesso. Obrigado pelo contato!");
    } catch (erro) {
        estado = "falha";
        // dados preservados: nada é limpo aqui
        definirStatus("falha", "Não foi possível enviar sua mensagem. Seus dados foram mantidos; clique em “Tentar novamente” ou use o e-mail acima.");
        botao.textContent = "Tentar novamente";
    } finally {
        if (estado !== "falha") botao.textContent = textoBotao;
        botao.setAttribute("aria-disabled", "false");
        form.setAttribute("aria-busy", "false");
        for (const r of form.elements.resultado) r.disabled = false;
        for (const campo of Object.values(campos)) campo.readOnly = false;
    }
});

/* Ao voltar a editar após erro/falha/sucesso, o estado volta a "edicao". */
form.addEventListener("input", (e) => {
    if (estado === "processando" || e.target.name === "resultado") return;
    if (estado === "erro-validacao" || estado === "falha" || estado === "sucesso") {
        estado = "edicao";
        botao.textContent = textoBotao;
    }
});
