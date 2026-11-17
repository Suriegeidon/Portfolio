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

// Validação simples antes de permitir o envio do formulário.
const contactForm = document.getElementById("contact-form");
if (contactForm) {
  contactForm.addEventListener("submit", (event) => {
    if (!contactForm.checkValidity()) {
      event.preventDefault();
      contactForm.reportValidity();
      return;
    }

    const button = contactForm.querySelector('button[type="submit"]');
    if (button) {
      button.disabled = true;
      button.textContent = "Preparando envio...";
    }
  });
}
