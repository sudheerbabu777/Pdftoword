const express = require('express')
const path = require('path')
const multer = require("multer")
const bodyparser = require('body-parser')
const fs = require('fs');
const { PDFDocument, PageSizes } = require('pdf-lib');


const app = express()
app.use(express.static("uploads"))
app.use(bodyparser.urlencoded({ extended: false }))
app.use(bodyparser.json())

const stroage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads")
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname))
    },
})

const upload = multer({ storage: stroage })

app.get("/", (req, res) => {
    res.sendFile(__dirname + "/index.html")
})



app.listen(3005, () => {
    console.log("Server is Running at port 3005")
})


app.post('/docxtopdf', upload.single('file'), (req, res) => {
    console.log(req.file.path)
    // const outputfilepath = Date.now() + 'output.docx'

    async function convertPDFToWord() {
        const outputfilepath = Date.now() + 'output.docx'

        const pdfPath = req.file.path;
        const wordPath = outputfilepath;
        const pdfBuffer = fs.readFileSync(pdfPath);

        const pdfDoc = await PDFDocument.load(pdfBuffer);

        const newDoc = await PDFDocument.create();

        const pages = pdfDoc.getPages();
        for (let i = 0; i < pages.length; i++) {
            const [newPage] = await newDoc.copyPages(pdfDoc, [i]);
            newDoc.addPage(newPage);
        }

        const wordBytes = await newDoc.save();

        const word = fs.writeFileSync(wordPath, wordBytes);
        console.log('PDF converted to Word successfully!');
        res.download(outputfilepath, () => {

        })

    }
    
    convertPDFToWord().catch((error) => {
        console.log('Error converting PDF to Word:', error);
    });   

});






