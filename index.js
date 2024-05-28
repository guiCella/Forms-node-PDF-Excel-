const express = require("express");
const bodyParser = require("body-parser");
const PDFDocument = require("pdfkit");
const ExcelJS = require("exceljs");
const fs = require("fs");
const path = require("path");
const moment = require("moment");

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public"))); // Servir arquivos estáticos

// Paths for storing files
const pdfDir = path.join(__dirname, "pdfs");
const excelDir = path.join(__dirname, "excels");

// Ensure directories exist
if (!fs.existsSync(pdfDir)) {
  fs.mkdirSync(pdfDir);
}
if (!fs.existsSync(excelDir)) {
  fs.mkdirSync(excelDir);
}

// Serve the HTML form
app.get("/", (req, res) => {
  res.send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Formulário de Coleta de Dados</title>
            <link rel="stylesheet" href="/css/style.css">
        </head>
        <body>
            <h1>Formulário de Coleta de Dados</h1>
            <form action="/submit" method="post" onsubmit="handleSubmit(event)">
                <label for="solicitante">Solicitante:</label>
                <input type="text" id="solicitante" name="solicitante" ><br><br>
                <label for="setor">Setor:</label>
                <input type="text" id="setor" name="setor" ><br><br>
                <label for="descricao">Descrição do problema:</label>
                <textarea id="descricao" name="descricao" ></textarea><br><br>
                <label for="data_servico">Data do serviço:</label>
                <input type="date" id="data_servico" name="data_servico" ><br><br>
                <label for="hora_inicio">Hora de início:</label>
                <input type="time" id="hora_inicio" name="hora_inicio" ><br><br>
                <label for="hora_fim">Hora de término:</label>
                <input type="time" id="hora_fim" name="hora_fim" ><br><br>
                <button type="submit">Enviar</button>
            </form>

            <div id="messageModal" class="modal">
        <div class="modal-content">
        <span class="close" onclick="closeModal()">&times;</span>
        <p id="modalMessage"></p>
                </div>
            </div>
        </div>

            <script src="/js/script.js"></script>
        </body>
        </html>
    `);
});

app.post("/submit", async (req, res) => {
  const { solicitante, setor, descricao, data_servico, hora_inicio, hora_fim } =
    req.body;

  const data_servico_formatted = new Date(data_servico).toLocaleDateString(
    "pt-BR"
  );
  const tempo_servico = `Dia: ${data_servico_formatted} das ${hora_inicio} / ${hora_fim}`;

  // Generate a timestamp for unique filenames
  const timestamp = moment().format("DD/MM/YYYY_HH:mm:ss");

  const ExcelJS = require("exceljs");
  let excelFileName = `Excel_${solicitante.substring(0, 3)}_${setor}_.xlsx`;
  let excelFile = path.join(excelDir, excelFileName);
  let i = 1;
  while (fs.existsSync(excelFile)) {
    excelFileName = `Excel_${solicitante.substring(0, 3)}_${setor}_${i}_.xlsx`;
    excelFile = path.join(excelDir, excelFileName);
    i++;
  }
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Sheet 1");

  // Now you can use worksheet
  worksheet.columns = [
    { header: "Solicitante", key: "solicitante" },
    { header: "Setor", key: "setor" },
    { header: "Descrição do problema", key: "descricao" },
    { header: "Tempo de serviço", key: "tempo_servico" },
  ];

  worksheet.addRow({ solicitante, setor, descricao, tempo_servico });
  await workbook.xlsx.writeFile(excelFile);

  // Generate PDF
  let pdfFileName = `${solicitante.substring(0, 3)}_${setor}.pdf`;
  let pdfFilePath = path.join(pdfDir, pdfFileName);
  i = 1;
  while (fs.existsSync(pdfFilePath)) {
    pdfFileName = `${solicitante.substring(0, 3)}_${setor}_${i}.pdf`;
    pdfFilePath = path.join(pdfDir, pdfFileName);
    i++;
  }
  const pdfDoc = new PDFDocument();

  pdfDoc.pipe(fs.createWriteStream(pdfFilePath));
  pdfDoc.text(`Solicitante: ${solicitante}`);
  pdfDoc.text(`Setor: ${setor}`);
  pdfDoc.text(`Descrição do problema: ${descricao}`);
  pdfDoc.text(`Tempo de serviço: ${tempo_servico}`);
  pdfDoc.end();

  // Redirect back to the form page
  res.redirect("/");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
