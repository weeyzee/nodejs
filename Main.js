const express = require('express');
const path = require('path');
const fs = require('fs');//----------------------------------------------------------------------------
const bcrypt = require('bcrypt');
const session = require('express-session');
const nodemailer = require('nodemailer');

const app = express()

app.set('view engine', 'ejs')

app.use(express.urlencoded({extended: false})) //Чтобы Express мог читать req.body, нужно добавить middleware (промежуточное ПО)
//позволяет серверу обрабатывать данные форм, которые отправляются через <form> в HTML

app.use(express.static('public'))
app.use(session({
    secret: 'mySecretKey',  // Секретный ключ для шифрования сессий
    resave: false,          //Если false, сессия не будет сохраняться в памяти сервера, если в ней ничего не менялось.
    saveUninitialized: false,   //Если false, сервер не будет создавать сессию, пока в нее не запишут данные (например, логин пользователя).
    cookie: { secure: false }  // `true`, если используешь HTTPS//false означает, что куки (файлы сессии) будут работать даже без HTTPS. Если true, то нужны защищенные соединения (HTTPS).
}));
app.use((req, res, next) => {
    res.locals.user = req.session.user;  // Делаем переменную доступной для всех шаблонов
    next();
});

const USERS_FILE = path.join(__dirname, 'users.json');

const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123' // Можно захешировать, но для простоты пока так
};

const transporter = nodemailer.createTransport({  //создает транспорт для отправки писем через SMTP.transporter — объект, который будет использоваться для отправки писем.
    host: "smtp.gmail.com", // SMTP-сервер Mail.ru //Это адрес почтового сервера, который обрабатывает отправку писем.
    port: 587,            // Порт (465 для SSL, 587 для TLS)
    secure: false,         // true для 465, false для 587
    auth: {     //Авторизация на сервере Mail.ru
        user: "mr.danik561@gmail.com",    // ВАШ ПОЧТОВЫЙ ЯЩИК
        pass: "nflg mres rukf edwy"          // ПАРОЛЬ ОТ ПОЧТЫ ИЛИ ПАРОЛЬ ПРИЛОЖЕНИЯ
    }
});

// Функция отправки письма
const sendEmail = async (email, username) => {
    try {
        let info = await transporter.sendMail({ //отправляет письмо через настроенный транспортер.info — объект с информацией о письме 
            from: '"Администрация сайта" <mr.danik561@gmail.com>', // Отправитель
            to: email,            // Получатель
            subject: `Здравствуйте ${username}!`,            // Тема письма
            html: "<b>Привет!</b> Это тестовое письмо из <i>Node.js</i>!" // HTML-сообщение
        });

        console.log("Письмо отправлено: ", info.messageId);
    } catch (error) {
        console.error("Ошибка при отправке: ", error);
    }
};
sendEmail("mr.danik4@mail.ru", "dan")
// Функция загрузки пользователей из файла
const loadUsers = () => {
    try {
        const data = fs.readFileSync(USERS_FILE, 'utf8');
        return JSON.parse(data);
    } catch (err) {
        return [];
    }
};

const saveUsers = (users) => {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
};

let users = loadUsers();

// Страница регистрации
app.get('/register', (req, res) => {
    res.render('register');
});

//----------------------------------------------------------------------------
app.post('/register', async (req, res) => {
    const { username, password, email } = req.body;  //названия в { username, password, email } должны совпадать с name="..." в HTML-форме.
    ////username=JohnDoe&password=secret123&email=johndoe@email.com
    if (users.find(u => u.username === username)) {             //array.find(element => условие)
        return res.send('Пользователь уже существует!');
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword, role: 'user', visits: 0, email}); // Устанавливаем роль 'user'
    saveUsers(users);
    res.redirect('/login');
});//----------------------------------------------------------------------------

// Страница входа
app.get('/login', (req, res) => {
    saveUsers(users);
    res.render('login');
});

//----------------------------------------------------------------------------
app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    // Проверяем, заходит ли администратор
    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        req.session.user = username;
        req.session.role = 'admin';
        return res.redirect('/');
    }

    // Проверяем обычных пользователей
    const user = users.find(u => u.username === username);
    if (user && await bcrypt.compare(password, user.password)) {
        req.session.user = user.username;//сохраняем имя пользователя в сессии.Это нужно, чтобы потом проверять авторизацию, например: if (req.session.role === 'admin') {
        req.session.role = user.role;
        user.visits += 1;
        req.session.visits = user.visits;
        return res.redirect('/');
    } else {
        res.send('Неверное имя пользователя или пароль');
    }
});
//----------------------------------------------------------------------------

app.get('/logout', (req, res) => {  
    req.session.destroy(() => {  
        res.redirect('/');
    });
});

app.get('/', (req, res) => {
    res.render('index', { user: req.session.user, role: req.session.role, visits: req.session.visits });
});


app.get('/about', (req, res) => {
    res.render('about') 
})

app.get('/user/:username/:id', (req, res) => {//динамическое знаечени
    let data = {username: req.params.username, hobbies: ['Футбол', 'Скейт', 'баскетбол']}
    //res.send(`User ID: ${req.params.id}. User Name: ${req.params.username}`)
    res.render('user', data)//, {username: req.params.username, hobbies: ['Футбол', 'Скейт', 'баскетбол']})//объект передающийся в ejs//через : значение (то что в ссылку username)
})

app.post('/check-user', (req, res) => {
    let username = req.body.username
    if (username == ""){
        return res.redirect('/')
    }
    else{
        return res.redirect('/user/' + username + '/4324234')
    }
})

app.post('/send-email', async (req, res) => {
    if (!req.session.user) {
        return res.status(401).send('Вы не авторизованы!');
    }

    const user = users.find(u => u.username === req.session.user);
    if (!user || !user.email) {
        return res.status(404).send('Email не найден!');
    }

    try {
        await sendEmail(user.email, req.session.user); 
        res.redirect('/');
    } catch (error) {
        res.status(500).send('Ошибка при отправке письма: ' + error.message);
    }

});

// Страница для админа - список пользователей
app.get('/admusers', (req, res) => {
    if (req.session.role !== 'admin') {
        return res.send('Доступ запрещен!');
    }
    
    const users = loadUsers(); // Загружаем пользователей из файла перед рендерингом
    res.render('admusers', { users });
});

const PORT = 8070
app.listen(PORT, () => {
    console.log('Server started: http://localhost:8070')
})
