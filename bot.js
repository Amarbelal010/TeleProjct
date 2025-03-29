require("dotenv").config();
const { Telegraf, Markup } = require("telegraf");
const express = require("express");
const cors = require("cors");
const fs = require("fs");

if (!process.env.BOT_TOKEN) {
    console.error("❌ خطأ: لم يتم العثور على توكن البوت. تأكد من ضبط متغير البيئة BOT_TOKEN.");
    process.exit(1);
}

const bot = new Telegraf(process.env.BOT_TOKEN);
const app = express();
app.use(cors());
app.use(express.json());

let players = {};
const DATA_FILE = "players.json";

// تحميل البيانات المخزنة بأمان
try {
    if (fs.existsSync(DATA_FILE)) {
        players = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    }
} catch (error) {
    console.error("⚠️ خطأ أثناء تحميل بيانات اللاعبين:", error);
}

// دالة حفظ البيانات بأمان
function saveData() {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify(players, null, 2));
    } catch (error) {
        console.error("⚠️ خطأ أثناء حفظ بيانات اللاعبين:", error);
    }
}

// أمر /start مع زر فتح الواجهة الرسومية
bot.start((ctx) => {
    try {
        const userId = ctx.from.id;
        if (!players[userId]) {
            players[userId] = { pet: "🐶", level: 1, exp: 0 };
            saveData();
        }
        ctx.reply(
            `أهلًا ${ctx.from.first_name}! لديك ${players[userId].pet}`,
            Markup.inlineKeyboard([
                Markup.button.webApp("🐾 فتح الواجهة", "https://689a-156-221-102-99.ngrok-free.app")
            ])
        );
    } catch (error) {
        console.error("⚠️ خطأ في /start:", error);
        ctx.reply("❌ حدث خطأ غير متوقع. حاول مرة أخرى لاحقًا.");
    }
});

// أمر التدريب لرفع مستوى الحيوان الأليف
bot.command("train", (ctx) => {
    try {
        const userId = ctx.from.id;
        if (!players[userId]) return ctx.reply("ابدأ باستخدام /start للحصول على حيوان أليف!");
        
        players[userId].exp += 10;
        if (players[userId].exp >= 50) {
            players[userId].level++;
            players[userId].exp = 0;
            ctx.reply(`🎉 تهانينا! ارتفع مستوى ${players[userId].pet} إلى ${players[userId].level}!`);
        } else {
            ctx.reply(`💪 تدريب ناجح! XP: ${players[userId].exp}/50`);
        }
        saveData();
    } catch (error) {
        console.error("⚠️ خطأ في /train:", error);
        ctx.reply("❌ حدث خطأ أثناء التدريب. حاول مرة أخرى لاحقًا.");
    }
});

// تشغيل البوت بأمان
try {
    bot.launch();
    console.log("🤖 بوت تيليجرام يعمل بنجاح!");
} catch (error) {
    console.error("❌ خطأ أثناء تشغيل البوت:", error);
    process.exit(1);
}

// API لاسترجاع بيانات اللاعب
app.get("/player", (req, res) => {
    try {
        const userId = req.query.id;
        if (!players[userId]) return res.status(404).json({ error: "لا يوجد لاعب بهذا المعرف" });
        res.json(players[userId]);
    } catch (error) {
        console.error("⚠️ خطأ في /player API:", error);
        res.status(500).json({ error: "❌ حدث خطأ في السيرفر" });
    }
});

// API لتحديث بيانات التدريب
app.post("/train", (req, res) => {
    try {
        const userId = req.body.id;
        if (!players[userId]) return res.status(404).json({ error: "لا يوجد لاعب بهذا المعرف" });

        players[userId].exp += 10;
        if (players[userId].exp >= 50) {
            players[userId].level++;
            players[userId].exp = 0;
        }
        saveData();
        res.json({ success: true, player: players[userId] });
    } catch (error) {
        console.error("⚠️ خطأ في /train API:", error);
        res.status(500).json({ error: "❌ حدث خطأ في السيرفر" });
    }
});

// تشغيل السيرفر بأمان
app.listen(3001, () => console.log("🚀 السيرفر يعمل على http://localhost:3001"));
