export type Category =
    | 'lazer'
    | 'casa'
    | 'alimentacao'
    | 'fastfood'
    | 'transporte'
    | 'saude'
    | 'salario'
    | 'outros';

export function getCategoryFromDescription(description: string, type: 'income' | 'expense'): Category {
    const lowerDesc = description.toLowerCase();

    // Mapping of keywords to categories
    const keywordsToCategory: Record<string, Category> = {
        'cinema': 'lazer',
        'filme': 'lazer',
        'jogo': 'lazer',
        'netflix': 'lazer',
        'spotify': 'lazer',
        'ingresso': 'lazer',
        'show': 'lazer',
        'passeio': 'lazer',
        'festa': 'lazer',
        'bar': 'lazer',

        'aluguel': 'casa',
        'luz': 'casa',
        'energia': 'casa',
        'agua': 'casa',
        'água': 'casa',
        'internet': 'casa',
        'condominio': 'casa',
        'condomínio': 'casa',
        'iptu': 'casa',
        'limpeza': 'casa',

        'mercado': 'alimentacao',
        'padaria': 'alimentacao',
        'feira': 'alimentacao',
        'acougue': 'alimentacao',
        'açougue': 'alimentacao',
        'supermercado': 'alimentacao',
        'hortifruti': 'alimentacao',

        'ifood': 'fastfood',
        'burger': 'fastfood',
        'pizza': 'fastfood',
        'mcdonalds': 'fastfood',
        'mc': 'fastfood',
        'méqui': 'fastfood',
        'bk': 'fastfood',
        'burguer king': 'fastfood',
        'lanche': 'fastfood',
        'sorvete': 'fastfood',
        'rappi': 'fastfood',
        'delivery': 'fastfood',

        'uber': 'transporte',
        'gasolina': 'transporte',
        'combustivel': 'transporte',
        'estacionamento': 'transporte',
        'onibus': 'transporte',
        'ônibus': 'transporte',
        'metro': 'transporte',
        'metrô': 'transporte',
        '99': 'transporte',
        'pedagio': 'transporte',
        'pedágio': 'transporte',

        'farmacia': 'saude',
        'farmácia': 'saude',
        'medico': 'saude',
        'médico': 'saude',
        'dentista': 'saude',
        'plano': 'saude',
        'convenio': 'saude',
        'hospital': 'saude',
        'exame': 'saude',
        'remedio': 'saude',
        'remédio': 'saude',

        'salario': 'salario',
        'salário': 'salario',
        'pagamento': 'salario',
        'vale': 'salario',
        'bonus': 'salario',
        'rendimento': 'salario',
        'adiantamento': 'salario',
        'pix': 'outros'
    };

    for (const [keyword, category] of Object.entries(keywordsToCategory)) {
        if (lowerDesc.includes(keyword)) {
            return category;
        }
    }

    return type === 'income' ? 'salario' : 'outros';
}

export const CATEGORY_LABELS: Record<Category, string> = {
    'lazer': 'Lazer 🍿',
    'casa': 'Casa 🏠',
    'alimentacao': 'Alimentação 🛒',
    'fastfood': 'Fastfood 🍔',
    'transporte': 'Transporte 🚗',
    'saude': 'Saúde 💊',
    'salario': 'Salário 💰',
    'outros': 'Outros 📦'
};
