export interface CardResponse {
  cards: Card[];
}

export interface Card {
  id: string;
  cardNumber: string;
  currentBalance: number;
  initialAmount?: number;
  createdAt: Date;
}

export interface CreateCardResponse {
  ok: boolean;
  msg: string;
}

export interface CardByIdResponse {
  ok: boolean;
  card: Card;
}

export interface HistorialResponse {
  ok: boolean;
  transactions: Transaction[];
}

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  createdAt: Date;
}

export interface TransationResponse {
  ok: boolean;
  msg: string;
  card: Card;
}
