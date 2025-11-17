#!/bin/bash

# Скрипт для настройки Vercel Postgres локально

echo "🚀 Настройка Vercel Postgres для ESAMIND"
echo ""

# Проверка Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI не установлен"
    echo "Установите: npm i -g vercel"
    exit 1
fi

echo "📥 Получение переменных окружения из Vercel..."
vercel env pull .env.local

if [ $? -eq 0 ]; then
    echo "✅ Переменные окружения получены"
    
    # Проверяем наличие PRISMA_DATABASE_URL
    if grep -q "PRISMA_DATABASE_URL" .env.local; then
        echo ""
        echo "📝 Настройка DATABASE_URL..."
        
        # Добавляем DATABASE_URL если его нет
        if ! grep -q "^DATABASE_URL=" .env.local; then
            # Извлекаем PRISMA_DATABASE_URL и используем как DATABASE_URL
            POSTGRES_URL=$(grep "PRISMA_DATABASE_URL=" .env.local | cut -d '=' -f2- | tr -d '"')
            echo "DATABASE_URL=$POSTGRES_URL" >> .env.local
            echo "✅ DATABASE_URL добавлен в .env.local"
        else
            echo "ℹ️  DATABASE_URL уже существует в .env.local"
        fi
        
        echo ""
        echo "🔄 Запуск миграций..."
        npx prisma migrate dev --name init_postgres
        
        echo ""
        echo "⚙️  Генерация Prisma Client..."
        npx prisma generate
        
        echo ""
        echo "✅ Настройка завершена!"
        echo ""
        echo "📋 Следующие шаги:"
        echo "1. Проверьте подключение: npx prisma studio"
        echo "2. Запустите dev сервер: npm run dev"
    else
        echo "⚠️  PRISMA_DATABASE_URL не найден в .env.local"
        echo "Убедитесь, что:"
        echo "1. База данных создана в Vercel Dashboard → Storage"
        echo "2. Проект подключен к Vercel: vercel link"
    fi
else
    echo "❌ Ошибка при получении переменных окружения"
    echo "Убедитесь, что:"
    echo "1. Вы залогинены: vercel login"
    echo "2. Проект подключен: vercel link"
fi

