var express = require('express');
const fileUpload = require('express-fileupload');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const router = express.Router();
var nodemailer = require('nodemailer');
const config = require('./config.json');


var app = express();
app.use(express.json()) // for parsing application/json
app.use(express.urlencoded({
    extended: true
})) // for parsing application/x-www-form-urlencoded
app.use(fileUpload());


var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: config.GMAIL_AUTH
});



app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname+'/index.html'));
});

// Mail Sending Code start 

app.get('/sendmail', function (req, res) {
    var usage=config.composemail;
    res.send(usage);
});

app.post('/sendmail', function (request, response) {

    if (request.body.to != undefined && request.body.subject != undefined && request.body.html != undefined) {
        //console.log(request.body);      // your JSON
        const att=(request.body.attachments!=undefined)?request.body.attachments:null;
        
        response.send("mail has been sent! "); // echo the result back
        var fm = (request.body.from == undefined) ? config.from_mail : request.body.from;
        var mailOptions = {
            from: fm + '<' + config.GMAIL_AUTH.user + '>',
            to: request.body.to,
            subject: request.body.subject,
            html: request.body.html,
            attachments:att
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
    }else
    response.send("Some thing went wrong!"); 
});

// Mail Sending Code End

//Multiple Files Upload Code start

app.post('/uploadfiles', function(req, res) {
    let filenames;
    let uploadPath;
    
    
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
    }
  
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    filenames = Array.isArray(req.files.filenames)?req.files.filenames:[req.files.filenames];
    //console.log(filenames);
    uploadPath = (req.body.path!='')?__dirname + '/uploads'+req.body.path:__dirname + '/uploads/' ;
    

    if(!fs.existsSync(uploadPath)){
                        fs.mkdir(path.join(uploadPath),
                { recursive: true }, (err) => {
                    if (err) {
                    return console.error(err);
                    }
                    console.log('Directory created successfully!');
                });
    }
  

            for(let i=0;i<filenames.length;i++){
                    
                    // Use the mv() method to place the file somewhere on your server
                    filenames[i].mv(uploadPath+filenames[i].name, function(err) {
                    if (err)
                        return res.status(500).send(err);
                        //console.log(i,filenames.length);
                        if(i==filenames.length-1)
                            res.send(filenames.length+' Files uploaded!');
                    });
            }
  });

//Multiple Files Upload Code End


//Single File Upload  with Limit Code start

app.post('/uploadfile', function(req, res) {
    let filename;
    let uploadPath;
    let filesize;
    
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send('No files were uploaded.');
    }
    filesize=(req.files.filename.size/1024)/1024;
    console.log(Number(filesize)<=Number(req.body.filesize))

    if (Number(filesize)>Number(req.body.filesize)) {
        return res.status(400).send('Upload file size below '+req.body.filesize+' Mb');
      }
    
  
    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    filename = req.files.filename;
    //console.log(filenames);
    uploadPath = (req.body.path!='')?__dirname + '/uploads'+req.body.path:__dirname + '/uploads/' ;
    
        if(!fs.existsSync(uploadPath)){
            fs.mkdir(path.join(uploadPath),
                { recursive: true }, (err) => {
                    if (err) {
                    return console.error(err);
                    }
                    console.log('Directory created successfully!');
                });
        }
    
        // Use the mv() method to place the file somewhere on your server
        filename.mv(uploadPath+filename.name, function(err) {
        if (err)
            return res.status(500).send(err);
            //console.log(i,filenames.length);    
            res.send(' File uploaded!');
        });
           
  });

//Single File Upload  with Limit Code End

// Create PDF Code start
app.get('/pdfs/:filename', (req,response)=> {
    var tempFile=req.params.filename;
    console.log(tempFile);
    fs.readFile(__dirname + '/uploads/pdfs/'+tempFile, function (err,data){
        response.contentType("application/pdf");
        response.send(data);
    });
});

app.post('/createpdf', function(req, resp) {

    var pdf = require('html-pdf');
    var html =req.body.htmltext;

    var options=config.pdfOptions;
    console.log(req.body.htmltext)
    var pdfpath = (req.body.path!=undefined)?__dirname + '/uploads/pdfs'+req.body.path:__dirname + '/uploads/pdfs/' ;
    if(!fs.existsSync(pdfpath)){
        fs.mkdir(path.join(pdfpath),
            { recursive: true }, (err) => {
                if (err) {
                return console.error(err);
                }
                console.log('Directory created successfully!');
            });
    }

    let filename=(req.body.filename==undefined)?uuidv4()+'.pdf':req.body.filename;
    pdf.create(html, options).toFile(pdfpath+filename, function(err, res) {
        if (err) return console.log(err);
        //console.log(res); // { filename: '/app/businesscard.pdf' }
        resp.redirect('pdfpath+filename');
      });

});






var server = app.listen(8000, function () {
    var host = server.address().address;
    var port = server.address().port;
    console.log('Example app listening at http://%s:%s', host, port);
});