"use strict";

const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".main-nav");

if (menuButton && navigation) {
  menuButton.addEventListener("click", () => {
    const isOpen = navigation.classList.toggle("open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
    menuButton.setAttribute("aria-label", isOpen ? "Fechar menu" : "Abrir menu");
  });

  navigation.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navigation.classList.remove("open");
      menuButton.setAttribute("aria-expanded", "false");
    });
  });
}

// Anima os elementos conforme entram na área visível da tela.
const revealElements = document.querySelectorAll(".reveal");

if ("IntersectionObserver" in window) {
  const observer = new IntersectionObserver((entries, currentObserver) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        currentObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealElements.forEach((element) => observer.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add("visible"));
}

// Atualiza o ano automaticamente no rodapé.
const year = document.getElementById("year");
if (year) year.textContent = new Date().getFullYear();

// ---------------------------------------------------------------
// Formulário de contato → Supabase (Edge Function) → Resend
// Troque a URL abaixo pela URL da sua função "send-contact".
// Formato: https://SEU-PROJETO.supabase.co/functions/v1/send-contact
// ---------------------------------------------------------------
const CONTACT_ENDPOINT = "'https://lrhskereycfgucrihyqq.supabase.co/functions/v1/hyper-processor";

const contactForm = document.getElementById("contact-form");
const formNote = document.getElementById("form-note");

function setNote(message, type) {
  if (!formNote) return;
  formNote.textContent = message;
  formNote.classList.remove("is-success", "is-error");
  if (type) formNote.classList.add(type === "success" ? "is-success" : "is-error");
}

if (contactForm) {
  contactForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!contactForm.checkValidity()) {
      contactForm.reportValidity();
      return;
    }

    if (CONTACT_ENDPOINT.includes("SEU-PROJETO")) {
      setNote("O formulário ainda não foi configurado (falta a URL do Supabase no script.js).", "error");
      return;
    }

    const button = contactForm.querySelector('button[type="submit"]');
    const originalLabel = button ? button.innerHTML : "";
    if (button) {
      button.disabled = true;
      button.textContent = "Enviando...";
    }
    setNote("Enviando sua mensagem...", null);

    const data = new FormData(contactForm);
    const payload = {
      name: data.get("name"),
      email: data.get("email"),
      subject: data.get("subject"),
      message: data.get("message"),
      website: data.get("website") // campo-armadilha anti-spam
    };

    try {
      const response = await fetch(CONTACT_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json().catch(() => ({}));

      if (response.ok && result.ok) {
        contactForm.reset();
        setNote("Mensagem enviada com sucesso! Responderei assim que possível.", "success");
      } else {
        setNote(result.error || "Não foi possível enviar agora. Tente novamente em instantes.", "error");
      }
    } catch (error) {
      setNote("Erro de conexão. Verifique sua internet e tente novamente.", "error");
    } finally {
      if (button) {
        button.disabled = false;
        button.innerHTML = originalLabel;
      }
    }
  });
}
