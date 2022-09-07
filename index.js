const express = require("express");
const app = express();
const path = require("path");
const fs = require("fs");
const mediaserver = require("mediaserver");
const multer = require("multer");

var opcionesMulter = multer.diskStorage({
    destination: function(req ,file, cb) {
        cb(null, path.join(__dirname, "canciones"))
    },
    filename: function(req, file, cb) {
        // corregir el envio de archivos, quitar la extension que es la que ocasiona el problema.
        cb(null, file.originalname)
    }
});

var upload = multer({storage: opcionesMulter});

app.set("port", 3000);
app.use(express.static(path.join(__dirname, "public")));
app.use("/jquery", express.static(path.join(__dirname, "node_modules", "jquery", "dist")));


app.post("/canciones", upload.single("cancion"), function(req, res){
    var nombre = req.file.originalname;
    var archivoCanciones = path.join(__dirname, "canciones.json")
    fs.readFile(archivoCanciones, "utf8", function(err, archivo) {
        if(err) throw err;
        var canciones = JSON.parse(archivo);
        canciones.push({nombre: nombre});
        fs.writeFile(archivoCanciones, JSON.stringify(canciones), function(err){
            if(err) throw err;
            res.sendFile(path.join(__dirname, "index.html"));
        })
    })
})

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/index.html"))
})

app.get("/canciones", (req, res) => {
    fs.readFile(path.join(__dirname, "canciones.json"), "utf8", (err, canciones) => {
        if(err) throw err;
        res.json(JSON.parse(canciones))
    });
})

app.get("/canciones/:nombre", (req ,res) => {
    var cancion = path.join(__dirname, "canciones", req.params.nombre);
    mediaserver.pipe(req, res, cancion);
})

app.listen(app.get("port"), () => {
    console.log("port", app.get("port"))
})