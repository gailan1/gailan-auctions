const express=require('express'), path=require('path'), fs=require('fs');
const bcrypt=require('bcryptjs'), jwt=require('jsonwebtoken'), multer=require('multer'), Database=require('better-sqlite3');
const app=express(), PORT=process.env.PORT||3000, JWT_SECRET=process.env.JWT_SECRET||'CHANGE_THIS_SECRET';
const db=new Database(process.env.DB_PATH||path.join(__dirname,'data.sqlite'));
db.exec(`CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY AUTOINCREMENT,username TEXT UNIQUE NOT NULL,password TEXT NOT NULL);
CREATE TABLE IF NOT EXISTS cars(id INTEGER PRIMARY KEY AUTOINCREMENT,user_id INTEGER NOT NULL,make TEXT,model TEXT,year INTEGER,vin TEXT,auction TEXT,lot TEXT,purchase REAL DEFAULT 0,auctionFee REAL DEFAULT 0,usTransport REAL DEFAULT 0,shipping REAL DEFAULT 0,localTransport REAL DEFAULT 0,customs REAL DEFAULT 0,repair REAL DEFAULT 0,parts REAL DEFAULT 0,labor REAL DEFAULT 0,other REAL DEFAULT 0,sale REAL DEFAULT 0,date TEXT,notes TEXT,created_at TEXT DEFAULT CURRENT_TIMESTAMP);
`);
if(db.prepare('SELECT COUNT(*) c FROM users').get().c===0){
 const user=process.env.ADMIN_USER||'admin', pass=process.env.ADMIN_PASSWORD||'ChangeMe123!';
 db.prepare('INSERT INTO users(username,password) VALUES(?,?)').run(user,bcrypt.hashSync(pass,10));
 console.log(`Initial login: ${user} / ${pass}`);
}
app.use(express.json()); app.use(express.static(path.join(__dirname,'public')));
function auth(req,res,next){try{const h=req.headers.authorization||''; if(!h.startsWith('Bearer ')) return res.status(401).json({error:'غير مسجل الدخول'}); req.user=jwt.verify(h.slice(7),JWT_SECRET); next()}catch(e){res.status(401).json({error:'جلسة الدخول منتهية'})}}
app.post('/api/login',(req,res)=>{const {username,password}=req.body||{},u=db.prepare('SELECT * FROM users WHERE username=?').get(username); if(!u||!bcrypt.compareSync(password||'',u.password))return res.status(401).json({error:'اسم المستخدم أو كلمة المرور غير صحيحة'});res.json({token:jwt.sign({id:u.id,username:u.username},JWT_SECRET,{expiresIn:'7d'}),username:u.username})});
app.get('/api/cars',auth,(req,res)=>res.json(db.prepare('SELECT * FROM cars WHERE user_id=? ORDER BY id DESC').all(req.user.id)));
app.post('/api/cars',auth,(req,res)=>{const c=req.body||{};const fields=['make','model','year','vin','auction','lot','purchase','auctionFee','usTransport','shipping','localTransport','customs','repair','parts','labor','other','sale','date','notes'];const vals=fields.map(k=>c[k]??(k==='year'?null:0));const q=`INSERT INTO cars(user_id,${fields.join(',')}) VALUES(?,${fields.map(()=>'?').join(',')})`;const r=db.prepare(q).run(req.user.id,...vals);res.json(db.prepare('SELECT * FROM cars WHERE id=?').get(r.lastInsertRowid))});
app.put('/api/cars/:id',auth,(req,res)=>{const c=req.body||{},fields=['make','model','year','vin','auction','lot','purchase','auctionFee','usTransport','shipping','localTransport','customs','repair','parts','labor','other','sale','date','notes'];const vals=fields.map(k=>c[k]??(k==='year'?null:0));db.prepare(`UPDATE cars SET ${fields.map(k=>k+'=?').join(',')} WHERE id=? AND user_id=?`).run(...vals,req.params.id,req.user.id);res.json(db.prepare('SELECT * FROM cars WHERE id=? AND user_id=?').get(req.params.id,req.user.id))});
app.delete('/api/cars/:id',auth,(req,res)=>{db.prepare('DELETE FROM cars WHERE id=? AND user_id=?').run(req.params.id,req.user.id);res.json({ok:true})});
app.get('*',(req,res)=>res.sendFile(path.join(__dirname,'public','index.html')));
app.listen(PORT,()=>console.log('Running on http://localhost:'+PORT));
