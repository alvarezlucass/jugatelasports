export interface BetItem {
    id: string;
    name: string;
    tokenValue: number;
    icon: string;
    category: 'DRINK' | 'FOOD' | 'OTHER';
}

export const BET_ITEMS: BetItem[] = [
    {
        id: 'item-fernet',
        name: 'Fernet con Coca',
        tokenValue: 500,
        icon: '🥃',
        category: 'DRINK'
    },
    {
        id: 'item-cerveza',
        name: 'Cerveza Fría',
        tokenValue: 300,
        icon: '🍺',
        category: 'DRINK'
    },
    {
        id: 'item-coca',
        name: 'Coca-Cola 2L',
        tokenValue: 200,
        icon: '🥤',
        category: 'DRINK'
    },
    {
        id: 'item-pizza',
        name: 'Pizza Grande',
        tokenValue: 800,
        icon: '🍕',
        category: 'FOOD'
    },
    {
        id: 'item-asado',
        name: 'Asado para 2',
        tokenValue: 2500,
        icon: '🥩',
        category: 'FOOD'
    }
];
