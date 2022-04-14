//Подключаем библиотеки
const express = require('express');
const cors = require("cors");
const { json } = require('body-parser');
const { func } = require('assert-plus');
var nodemailer = require('nodemailer');
const sqlite3 = require('sqlite3').verbose();

//Подключение к БД
let db = new sqlite3.Database('db.sqlite');


//Создаем приложение на основе экспресс
const app = express();

//Приложение использует cors
app.use(cors());

//Чтобы читал 'application/json'
app.use(express.static(__dirname));
app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));

app.patch("/success" , function(request, response) {

    let data = request.body;
    let sql = "UPDATE psychologist SET status = 1 WHERE id = " + data.id;
    console.log(sql);
    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
      
    });

})

app.patch("/order" , function(request, response) {

    let data = request.body;
    let sql = "UPDATE client SET status = '"+data.status+"' WHERE id_client = " + data.id;
    console.log(sql);
    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
      
    });

})

app.post('/sendSupport', function(request, response) {
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'psysystem169@gmail.com',
          pass: 'Zsxdcf123'
        }
      });
      var mailOptions = {
        from: 'psysystem169@gmail.com',
        to: 'psysystem169@gmail.com',
        subject: 'Запрос к тех.поддержке',
        text: 'сообщение - ' + request.body.text + ' Отправитель - ' + request.body.data
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
        }
      });

})

app.post("/order", function(request, response){
    let data = request.body;
    console.log(data);
    let sql = "INSERT INTO client (FIO, mail, phone, message, id) VALUES ('"+data.FIO+"', '"+data.Mail+"', '"+data.Phone+"', '"+data.Message+"', '"+data.id_psychologist+"')";
    db.run(sql, function(err){
        if (err) {
            throw err;
        }
    })
})

app.post("/psychologist", function(request, response){
    let id;
    let data = request.body;
    let create_education = '';
    let create_psymodule = '';

    let sql = "INSERT INTO psychologist (FIO, bid, avatar, detail, adress, about, gender, experience, login, password) VALUES ('"+data.FIO+"', '"+data.bid+"', '"+data.avatar+"', '"+data.detail+"', '"+data.adress+"', '"+data.about+"', '"+data.gender+"', '"+data.experience+"', '"+data.login+"', '"+data.password+"')";
    db.run(sql, function(err){
        if (err) {
            throw err;
        }
        id = this.lastID;
        console.log(id);

        for (var i = 0; i < data.education.length; i++){
            create_education = create_education + "('" + data.education[i].year + "','" + data.education[i].name + "','" + data.education[i].link + "', '"+id +"'),";
        }

        for (var i = 0; i < data.psymodule.length; i++){
            create_psymodule = create_psymodule + "('" + data.psymodule[i] + "','" + id +"'),";
        }
        
        create_education.substring();
        sql_create_ed = "INSERT INTO education (year, name, photo, id_psychologist) VALUES " + create_education.slice(0, -1);
        create_psymodule.substring();
        sql_create_psy = "INSERT INTO psymodule (id_module, id_psychologist) VALUES " + create_psymodule.slice(0, -1);
        console.log(sql_create_ed);
        console.log(sql_create_psy);
        db.run(sql_create_ed, function(err){
            if (err){
                throw err;
            }
        })
        db.run(sql_create_psy, function(err){
            if (err){
                throw err;
            }
        })

    });

});

app.get("/psychologist", function(request, response) {
    
    let sql = "SELECT * FROM psychologist WHERE id = " + request.query.id;
    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
      
        response.send(rows);
        console.log(rows);
    });

});

app.get("/order", function(request, response) {
    
    let sql = "SELECT client.*, psychologist.FIO AS PsyFIO FROM client, psychologist WHERE client.id = psychologist.id";
    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
      
        response.send(rows);
        console.log(rows);
    });

});

app.get("/application", function(request, response) {
    
    console.log(request.query);
    console.log(request.query.module);
    console.log(request.query.gen);
    let sql = "SELECT * FROM psychologist WHERE status  = 0";
    console.log(sql);
    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
      
        response.send(rows);
        console.log(rows);
    });

});

app.get("/edu", function(request, response){
    
    let sql = "SELECT *  FROM education WHERE id_psychologist = " + request.query.id;
    console.log(sql);
    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
      
        response.send(rows);
        console.log(rows);
    });
});

app.get("/orderByID", function(request, response){
    
    let sql = "SELECT * FROM client WHERE id = " + request.query.id;
    console.log(sql);
    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
      
        response.send(rows);
        console.log(rows);
    });
})



app.get("/psy", function(request, response) {
    
    console.log(request.query);
    console.log(request.query.module);
    console.log(request.query.gen);
    let sql = "SELECT psychologist.*, psymodule.id_psychologist FROM psychologist, psymodule WHERE psymodule.id_module IN ("+request.query.module+") AND psychologist.id = psymodule.id_psychologist "+request.query.gen+" GROUP BY psymodule.id_psychologist";
    console.log(sql);
    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
      
        response.send(rows);
        console.log(rows);
    });

});

app.get("/module", function(request, response) {
    
    let sql = "SELECT json_object('name', subitem.name, 'module', json_group_array( json_object('moduleID', module.id_module, 'moduleName', module.name))) json_result FROM subitem, module WHERE module.id_subitem = subitem.id_subitem AND subitem.id_item ="+request.query.id+" GROUP BY subitem.name";
    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
      
        response.send(rows);
        console.log(rows);
    });

});

app.get("/allmodule", function(request, response) {
    
    let sql = "SELECT json_object('name', subitem.name, 'module', json_group_array( json_object('moduleID', module.id_module, 'moduleName', module.name))) json_result FROM subitem, module WHERE module.id_subitem = subitem.id_subitem  GROUP BY subitem.name";
    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
      
        response.send(rows);
        console.log(rows);
    });

});

app.get("/login", function(request, response){
    let sql = 'SELECT * FROM psychologist WHERE login = "'+request.query.login+'" AND password = "'+request.query.pass+'"';
    db.all(sql, [], (err, rows) => {
        if (err) {
            throw err;
        }
      
        response.send(rows);
        
    });
})

app.get('/', function(req, res) {
    res.sendfile('index.html');
  });   

//Приложение слушает 4000 порт
app.listen(3000);
console.log("Сервер на порту 3000: Запущен");

