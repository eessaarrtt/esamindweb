# 📋 Процесс обработки заказа в ESAMIND

## 🔄 Полный цикл от покупки до доставки

### 1️⃣ **ПОКУПКА НА ETSY**
Пользователь покупает один из 30 продуктов на Etsy. При оформлении заказа:
- Покупатель заполняет поле "Personalization" (если требуется)
- Etsy создает Receipt (чек) и Transaction (транзакцию)
- Заказ помечается как `was_digital=true` и `was_shipped=false`

---

### 2️⃣ **СИНХРОНИЗАЦИЯ ЗАКАЗОВ** (`/api/orders/sync`)

**Когда:** Администратор нажимает "Sync Orders Now" в Dashboard

**Что происходит:**
1. Система получает список всех подключенных Etsy магазинов из БД
2. Для каждого магазина:
   - Вызывается `EtsyClient.getReceipts()` → получаем список Receipts
   - Для каждого Receipt:
     - Вызывается `EtsyClient.getReceiptTransactions()` → получаем Transactions
     - Для каждой Transaction:
       - Проверяем, существует ли уже Order с таким `etsyReceiptId`
       - Если нет → создаем новый Order:
         - Парсим `personalization` через `parsePersonalization()`
         - Ищем `EtsyListing` по `listing_id` → получаем `productCode`
         - Создаем Order со статусом `PENDING`

**Результат:** Новые заказы появляются в Dashboard со статусом `PENDING`

---

### 3️⃣ **ГЕНЕРАЦИЯ ЧТЕНИЯ** (`/api/readings/generate`)

**Когда:** 
- **Автоматически:** При синхронизации нового заказа (если `productCode !== 'unknown'`)
- **Вручную:** Администратор открывает заказ и нажимает "Generate Reading"

**Что происходит:**
1. Система получает Order из БД по `orderId`
2. Проверяет наличие промпта в БД или в `PRODUCT_PROMPTS`
3. Собирает `ReadingInput`:
   ```typescript
   {
     name: order.name,           // из парсинга personalization
     age: order.age,             // из парсинга personalization
     question: order.question,   // из парсинга personalization
     rawPersonalization: order.personalization  // исходный текст
   }
   ```
4. Генерирует промпт:
   - **Приоритет 1:** Промпт из БД (`Prompt` таблица)
   - **Приоритет 2:** Кастомный промпт из файла (`PRODUCT_PROMPTS`)
   - **Приоритет 3:** Автоматическая генерация шаблона
5. Вызывается `generateReading(prompt)`:
   - Отправка запроса в OpenAI API
   - Получение сгенерированного текста чтения
   - Сохранение данных об использовании (токены, стоимость, модель)
6. Сохранение результата:
   - `order.readingText = generatedText`
   - `order.status = 'GENERATED'`
   - `order.openaiModel`, `order.openaiInputTokens`, `order.openaiOutputTokens`, `order.openaiCost`

**7. АВТОМАТИЧЕСКАЯ ОТПРАВКА КЛИЕНТУ:**
   - Если есть `buyerUserId` и `shop.etsyShopId`:
     - Создается или находится conversation с покупателем через Etsy API
     - Отправляется сообщение с текстом чтения через `EtsyClient.sendMessageToBuyer()`
     - При успешной отправке: `order.status = 'SENT'`
   - Если отправка не удалась: статус остается `GENERATED`, администратор может отправить вручную

**Результат:** 
- Заказ получает статус `GENERATED` или `SENT` (если отправка прошла успешно)
- Чтение отображается в Dashboard
- Клиент получает сообщение через Etsy Conversations (если отправка прошла успешно)

---

### 4️⃣ **РУЧНАЯ ОТПРАВКА** (опционально)

**Когда:** 
- Автоматическая отправка не удалась
- Администратор хочет отправить сообщение вручную

**API Endpoints:**
- `/api/orders/[id]/send-message` — отправляет сообщение клиенту и помечает как SENT
- `/api/orders/[id]/mark-sent` — помечает как SENT (также пытается отправить сообщение, если есть чтение)

**Что происходит:**
1. Система получает Order из БД
2. Проверяет наличие `readingText`, `buyerUserId`, `shop.etsyShopId`
3. Вызывает `EtsyClient.sendMessageToBuyer()`:
   - Получает или создает conversation с покупателем
   - Отправляет сообщение с текстом чтения
4. Обновляет статус: `order.status = 'SENT'`

**Результат:** Заказ помечен как отправленный, клиент получил сообщение

---

## 📊 Маппинг Product Code → Etsy Listing

Для работы системы необходимо настроить маппинг:

**В БД: `EtsyListing`**
- `etsyListingId` — ID листинга на Etsy
- `productCode` — внутренний код продукта (см. список ниже)

**Пример:**
```typescript
{
  etsyListingId: "123456789",
  productCode: "3_card",
  title: "Personal Tarot Reading – 3-Card Insight"
}
```

---

## 🗂️ Product Codes для всех 30 продуктов

Все product codes определены в `lib/products.ts` с типами и категориями.

### 🔮 ТАРО и ДИВИНАЦИЯ (услуги)
1. `tarot_3_card` — Personal Tarot Reading – 3-Card Insight
2. `tarot_deep_love` — Deep Love & Relationship Tarot Reading
3. `tarot_career_direction` — Career & Life Direction Tarot Reading
4. `tarot_shadow_work` — Shadow Work Tarot Reading (Facing Inner Blocks)
5. `tarot_yes_no_energy` — Yes/No Energy Scan with Intuitive Message
6. `tarot_future_3_months` — Future Path Reading – Your Next 3 Months
7. `tarot_soul_purpose` — Soul Purpose Tarot Reading
8. `tarot_decision_two_paths` — Decision Guidance Spread – Choose Between Two Paths
9. `tarot_karmic_connection` — Karmic Connection Reading (Your Bond with Someone)
10. `tarot_twin_soulmate` — Twin Flame / Soulmate Energy Reading

### ☕ ЭНЕРГИЯ, ЧТЕНИЯ и ИНТУИЦИЯ
11. `energy_aura_field` — Aura & Energy Field Reading
12. `energy_intuitive_message` — Intuitive Message from Spirit (Written PDF)
13. `energy_channeled_message` — Channeled Message for Your Current Situation
14. `energy_blocked_scan` — Blocked Energy Scan — What's Holding You Back
15. `energy_daily_weekly_guidance` — Daily or Weekly Guidance Message
16. `energy_cord_connection` — Energy Cord Reading (Connection with a Person)
17. `energy_higher_self` — Message from Your Higher Self
18. `energy_past_life` — Past Life Insight Reading

### ✨ РИТУАЛЫ И ИНСТРУМЕНТЫ (цифровые продукты)
19. `ritual_cleansing` — Ritual for Cleansing Energy (PDF Guide)
20. `ritual_manifest_love` — Manifestation Ritual for Love / Self-Love
21. `ritual_full_moon` — Full Moon Ritual Guide
22. `ritual_new_moon` — New Moon Manifestation Workbook
23. `ritual_journal_daily` — Daily Spiritual Journal Template (Printable)
24. `ritual_alignment_calendar` — Alignment Calendar – Monthly Energies & Intentions
25. `ritual_affirmation_cards` — Affirmation Cards Set (Printable)
26. `ritual_protection` — Protection Ritual + Instructions (PDF)
27. `ritual_money_prosperity` — Money Energy Ritual & Prosperity Guide
28. `ritual_dream_guide` — Dream Interpretation Guide (PDF)

### 🪄 ПРЕМИУМ / ПАКЕТЫ
29. `premium_full_package` — Full Spiritual Reading Package (Tarot + Energy + Message)
30. `premium_year_ahead` — "Your Year Ahead" — 12-Month Forecast Reading (PDF)

---

## 🔧 Настройка маппинга Listing → Product Code

### Как система определяет productCode для заказа:

1. **При синхронизации заказа:**
   - Система получает `transaction.listing_id` из Etsy API
   - Ищет в БД запись `EtsyListing` с `etsyListingId = listing_id`
   - Если найдена → использует `productCode` из этой записи
   - Если не найдена → использует `productCode = 'unknown'`

2. **Для заказов с `productCode = 'unknown':**
   - Генерация чтения не выполняется автоматически
   - Администратор должен вручную настроить маппинг и затем сгенерировать чтение

### Настройка маппинга через Dashboard:

1. **Синхронизация листингов из Etsy:**
   - Перейдите в `/dashboard/listings`
   - Выберите магазин из фильтра
   - Нажмите "Sync Listings from Etsy"
   - Система загрузит все активные листинги из Etsy и создаст записи в БД

2. **Маппинг листинга к product code:**
   - В списке листингов найдите нужный листинг
   - Выберите соответствующий `productCode` из выпадающего списка
   - Система автоматически сохранит маппинг

3. **Проверка маппинга:**
   - На странице `/dashboard/shops` видно количество mapped/unmapped листингов
   - Листинги с `productCode = 'unknown'` подсвечиваются красным

### Программная настройка (опционально):

```typescript
import { PRODUCTS } from '@/lib/products'
   
await prisma.etsyListing.create({
  data: {
    etsyListingId: "123456789",
    title: PRODUCTS.tarot_3_card.title,
    productCode: PRODUCTS.tarot_3_card.code,
    shopId: shop.id
  }
})
```

---

## 📝 Особенности для PDF-продуктов

Для продуктов 19-28 (PDF-гиды и инструменты):
- Генерируется текстовое содержание PDF
- Содержание сохраняется в `order.readingText`
- Администратор может:
  - Скопировать текст
  - Создать PDF вручную
  - Или автоматизировать создание PDF (будущая функция)

---

## 🚨 Обработка ошибок

- **Order не найден** → 404
- **ProductCode не найден в PRODUCT_PROMPTS** → 400
- **OpenAI API ошибка** → 500, статус `ERROR`
- **Etsy API ошибка при синхронизации** → логируется, заказ пропускается

---

## 📈 Статусы заказа

- `PENDING` — заказ синхронизирован, чтение не сгенерировано
- `GENERATED` — чтение сгенерировано, готово к отправке
- `SENT` — отправлено клиенту
- `ERROR` — ошибка при генерации

