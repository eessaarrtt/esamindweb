export type ProductCategory = "tarot" | "energy" | "ritual" | "premium";

export type ProductCode =
  // 🔮 ТАРО и ДИВИНАЦИЯ
  | "tarot_3_card"
  | "tarot_deep_love"
  | "tarot_career_direction"
  | "tarot_shadow_work"
  | "tarot_yes_no_energy"
  | "tarot_future_3_months"
  | "tarot_soul_purpose"
  | "tarot_decision_two_paths"
  | "tarot_karmic_connection"
  | "tarot_twin_soulmate"
  // ☕ ЭНЕРГИЯ, ЧТЕНИЯ и ИНТУИЦИЯ
  | "energy_aura_field"
  | "energy_intuitive_message"
  | "energy_channeled_message"
  | "energy_blocked_scan"
  | "energy_daily_weekly_guidance"
  | "energy_cord_connection"
  | "energy_higher_self"
  | "energy_past_life"
  // ✨ РИТУАЛЫ И ИНСТРУМЕНТЫ
  | "ritual_cleansing"
  | "ritual_manifest_love"
  | "ritual_full_moon"
  | "ritual_new_moon"
  | "ritual_journal_daily"
  | "ritual_alignment_calendar"
  | "ritual_affirmation_cards"
  | "ritual_protection"
  | "ritual_money_prosperity"
  | "ritual_dream_guide"
  // 🪄 ПРЕМИУМ / ПАКЕТЫ
  | "premium_full_package"
  | "premium_year_ahead";

export type ProductDefinition = {
  code: ProductCode;
  title: string;
  category: ProductCategory;
};

// Словарь всех продуктов ESAMIND
export const PRODUCTS: Record<ProductCode, ProductDefinition> = {
  // 🔮 ТАРО и ДИВИНАЦИЯ
  tarot_3_card: {
    code: "tarot_3_card",
    title: "Personal Tarot Reading – 3-Card Insight",
    category: "tarot",
  },
  tarot_deep_love: {
    code: "tarot_deep_love",
    title: "Deep Love & Relationship Tarot Reading",
    category: "tarot",
  },
  tarot_career_direction: {
    code: "tarot_career_direction",
    title: "Career & Life Direction Tarot Reading",
    category: "tarot",
  },
  tarot_shadow_work: {
    code: "tarot_shadow_work",
    title: "Shadow Work Tarot Reading (Facing Inner Blocks)",
    category: "tarot",
  },
  tarot_yes_no_energy: {
    code: "tarot_yes_no_energy",
    title: "Yes/No Energy Scan with Intuitive Message",
    category: "tarot",
  },
  tarot_future_3_months: {
    code: "tarot_future_3_months",
    title: "Future Path Reading – Your Next 3 Months",
    category: "tarot",
  },
  tarot_soul_purpose: {
    code: "tarot_soul_purpose",
    title: "Soul Purpose Tarot Reading",
    category: "tarot",
  },
  tarot_decision_two_paths: {
    code: "tarot_decision_two_paths",
    title: "Decision Guidance Spread – Choose Between Two Paths",
    category: "tarot",
  },
  tarot_karmic_connection: {
    code: "tarot_karmic_connection",
    title: "Karmic Connection Reading (Your Bond with Someone)",
    category: "tarot",
  },
  tarot_twin_soulmate: {
    code: "tarot_twin_soulmate",
    title: "Twin Flame / Soulmate Energy Reading",
    category: "tarot",
  },

  // ☕ ЭНЕРГИЯ, ЧТЕНИЯ и ИНТУИЦИЯ
  energy_aura_field: {
    code: "energy_aura_field",
    title: "Aura & Energy Field Reading",
    category: "energy",
  },
  energy_intuitive_message: {
    code: "energy_intuitive_message",
    title: "Intuitive Message from Spirit (Written PDF)",
    category: "energy",
  },
  energy_channeled_message: {
    code: "energy_channeled_message",
    title: "Channeled Message for Your Current Situation",
    category: "energy",
  },
  energy_blocked_scan: {
    code: "energy_blocked_scan",
    title: "Blocked Energy Scan — What's Holding You Back",
    category: "energy",
  },
  energy_daily_weekly_guidance: {
    code: "energy_daily_weekly_guidance",
    title: "Daily or Weekly Guidance Message",
    category: "energy",
  },
  energy_cord_connection: {
    code: "energy_cord_connection",
    title: "Energy Cord Reading (Connection with a Person)",
    category: "energy",
  },
  energy_higher_self: {
    code: "energy_higher_self",
    title: "Message from Your Higher Self",
    category: "energy",
  },
  energy_past_life: {
    code: "energy_past_life",
    title: "Past Life Insight Reading",
    category: "energy",
  },

  // ✨ РИТУАЛЫ И ИНСТРУМЕНТЫ (цифровые продукты)
  ritual_cleansing: {
    code: "ritual_cleansing",
    title: "Ritual for Cleansing Energy (PDF Guide)",
    category: "ritual",
  },
  ritual_manifest_love: {
    code: "ritual_manifest_love",
    title: "Manifestation Ritual for Love / Self-Love",
    category: "ritual",
  },
  ritual_full_moon: {
    code: "ritual_full_moon",
    title: "Full Moon Ritual Guide",
    category: "ritual",
  },
  ritual_new_moon: {
    code: "ritual_new_moon",
    title: "New Moon Manifestation Workbook",
    category: "ritual",
  },
  ritual_journal_daily: {
    code: "ritual_journal_daily",
    title: "Daily Spiritual Journal Template (Printable)",
    category: "ritual",
  },
  ritual_alignment_calendar: {
    code: "ritual_alignment_calendar",
    title: "Alignment Calendar – Monthly Energies & Intentions",
    category: "ritual",
  },
  ritual_affirmation_cards: {
    code: "ritual_affirmation_cards",
    title: "Affirmation Cards Set (Printable)",
    category: "ritual",
  },
  ritual_protection: {
    code: "ritual_protection",
    title: "Protection Ritual + Instructions (PDF)",
    category: "ritual",
  },
  ritual_money_prosperity: {
    code: "ritual_money_prosperity",
    title: "Money Energy Ritual & Prosperity Guide",
    category: "ritual",
  },
  ritual_dream_guide: {
    code: "ritual_dream_guide",
    title: "Dream Interpretation Guide (PDF)",
    category: "ritual",
  },

  // 🪄 ПРЕМИУМ / ПАКЕТЫ
  premium_full_package: {
    code: "premium_full_package",
    title: "Full Spiritual Reading Package (Tarot + Energy + Message)",
    category: "premium",
  },
  premium_year_ahead: {
    code: "premium_year_ahead",
    title: "Your Year Ahead - 12-Month Forecast Reading (PDF)",
    category: "premium",
  },
};

// Удобный массив, если нужно перебирать все продукты
export const ALL_PRODUCT_CODES: ProductCode[] = Object.keys(
  PRODUCTS
) as ProductCode[];

