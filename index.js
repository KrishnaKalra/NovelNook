import express from "express";
import axios from "axios";
import pg from "pg";
import bodyParser from "body-parser";
const app=express();
const db=new pg.Client({
    user:"postgres",
    host:"localhost",
    database:"NovelNook DataBase",
    password:"#Krishna123",
    port:5432
});
db.connect();
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
const port=3000;
app.get("/",async(req,res)=>{
    const rows=await db.query("SELECT reviews.id,book_name,author_name,isbn,review,user_name FROM reviews JOIN users ON reviews.user_id=users.id");
    const data=rows.rows;
    console.log(data);
    res.render("index.ejs",{
        data:data,
    });
}) 
app.get("/input", (req,res)=>{
    let bval=true;
    res.render("input.ejs",{
        disval:bval,
        disisbn:false,
        alert:false,
        success:false,
        post:"/submit"
    });
})
app.post("/isbn-submit",async (req,res)=>{
    let isbn=req.body.isbn;
    let link="http://openlibrary.org/api/volumes/brief/isbn/"+isbn+".json";
    try{
    const response=await axios.get(link);
    let records=response.data.records;
    const address=records[Object.keys(records)[0]];
    console.log(address);
    const data=(address.details.details);
    console.log(data.title);
    console.log(address.data.authors[0].name);
    res.render("input.ejs",{
        disval:false,
        disisbn:true,
        alert:false,
        bookname:data.title,
        bookauthor:address.data.authors[0].name,
        isbnnumber:isbn,
        success:false,
        post:"/submit"
    });
    }
    catch(err){
        console.error(err);
        res.render("input.ejs",{
            disval:true,
            disisbn:false,
            alert:true,
            success:false,
            post:"/submit"
        });
    }
});
app.post("/submit",(req,res)=>{
    console.log(req.body);
    try{
    db.query("INSERT INTO reviews(book_name,author_name,isbn,user_id,review) VALUES($1,$2,$3,$4,$5)",[req.body.book,req.body.author,req.body.isbn,1,req.body.book_review]);
    res.render("input.ejs",{
        disval:true,
        disisbn:false,
        alert:false,
        success:true,
        post:"/submit"
    })
    }
    catch(err){
        console.error(err);
    }
})
app.post("/delete",(req,res)=>{
    let id=req.body.id;
    try{
    db.query("DELETE FROM reviews WHERE $1=reviews.id",[id]);
    res.redirect("/");
    }
    catch(err){
        console.error(err);
    }

})
app.post("/update-page",async (req,res)=>{
    let id=req.body.id;
    console.log(id);
    const data=await db.query("SELECT reviews.id,book_name,author_name,isbn,review,user_name FROM reviews JOIN users ON reviews.user_id=users.id WHERE reviews.id=$1",[id]);
    const rows=data.rows[0];
    console.log(rows);
    res.render("input.ejs",{
        disval:false,
        disisbn:true,
        alert:false,
        bookname:rows.book_name,
        bookauthor:rows.author_name,
        isbnnumber:rows.isbn,
        success:false,
        post:"/update"
    });
});
app.post("/update",async (req,res)=>{
    db.query("UPDATE reviews SET review=$1 WHERE reviews.book_name=$2",[req.body.book_review,req.body.book]);
    res.redirect("/");
})
app.post("/search",async (req,res)=>{
    const rows=await db.query("SELECT reviews.id,book_name,author_name,isbn,review,user_name FROM reviews JOIN users ON reviews.user_id=users.id WHERE lower(reviews.book_name) LIKE '%'||$1||'%'",[req.body.searchVal.toLowerCase()]);
    const data=rows.rows;
    console.log(data);
    res.render("index.ejs",{
        data:data,
    });
})
app.listen((port),()=>{
    console.log(`Listening to port ${port}`)
});
 