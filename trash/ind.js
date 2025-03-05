let num = 5
console.log(`Variable: ${num}`)

const fs = require("fs");

fs.writeFileSync("text.txt", "Hello from Node.js!");
console.log("Файл записан!");

const data = fs.readFileSync("text.txt", "utf-8");
console.log("Прочитанное из файла:", data);

// Запись файла асинхронно
fs.writeFile("text.txt", "Hello from async Node.js!", (err) => {
    if (err) {
        console.error("Ошибка при записи файла:", err);
    } else {
        console.log("Файл записан (асинхронно)!");

        // Чтение файла после записи
        fs.readFile("text.txt", "utf-8", (err, data) => {
            if (err) {
                console.error("Ошибка при чтении файла:", err);
            } else {
                console.log("Прочитанное из файла (асинхронно):", data);
            }
        });
    }
});

