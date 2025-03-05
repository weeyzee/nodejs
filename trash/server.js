const http = require("http");

const html = `
<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Мой сервер</title>
</head>
<body>
    <h1>Добро пожаловать на мой сервер!</h1>
    <p>Выберите страницу:</p>
    <button onclick="location.href='/'">Главная</button>
    <button onclick="location.href='/about'">О нас</button>
    <button onclick="location.href='/contact'">Контакты</button>
</body>
</html>
`;

const server = http.createServer((req, res) => {
    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });

    if (req.url == "/") {
        res.end(html);
    } else if (req.url === "/about") {
        res.end("<h1>О нас</h1><p>Это страница 'О нас'. <a href='/'>На главную</a></p>");
    } else if (req.url === "/contact") {
        res.end("<h1>Контакты</h1><p>Свяжитесь с нами по email: example@example.com. <a href='/'>На главную</a></p>");
    } else {
        res.writeHead(404, { "Content-Type": "text/html; charset=utf-8" });
        res.end("<h1>Ошибка 404</h1><p>Страница не найдена. <a href='/'>На главную</a></p>");
    }
});

server.listen(3000, () => {
    console.log("Сервер запущен на http://localhost:3000");
});
