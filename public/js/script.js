function validateForm() {
  var solicitante = document.getElementById("solicitante").value;
  var setor = document.getElementById("setor").value;
  var descricao = document.getElementById("descricao").value;
  var data_servico = document.getElementById("data_servico").value;
  var hora_inicio = document.getElementById("hora_inicio").value;
  var hora_fim = document.getElementById("hora_fim").value;

  if (
    !solicitante ||
    !setor ||
    !descricao ||
    !data_servico ||
    !hora_inicio ||
    !hora_fim
  ) {
    return false;
  }

  return true;
}

async function handleSubmit(event) {
  event.preventDefault();
  if (validateForm()) {
    alert("Enviado com sucesso =]");
    await fetch("/submit", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams(new FormData(event.target)).toString(),
    });
    window.location.href = "/";
  } else {
    alert("Por favor, preencha todos os campos.");
  }
}
