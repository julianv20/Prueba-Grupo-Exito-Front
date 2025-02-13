import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap, map } from 'rxjs';
import {
  Card,
  CardByIdResponse,
  CardResponse,
  CreateCardResponse,
  HistorialResponse,
  TransationResponse,
} from '../interface/cards.types';

interface CreateTransactionPayload {
  description: string;
  amount: number;
  id: string;
}
interface DeleteCardResponse {
  ok: boolean;
  msg: string;
}

@Injectable({ providedIn: 'root' })
export class CardsService {
  private readonly API_URL = 'http://localhost:8080';

  private cardsSubject = new BehaviorSubject<Card[]>([]);
  private currentCardSubject = new BehaviorSubject<Card | null>(null);

  public cards$ = this.cardsSubject.asObservable();
  public currentCard$ = this.currentCardSubject.asObservable();
  private isLoaded = false;

  constructor(private http: HttpClient) {}

  getCards(token: string): Observable<CardResponse> {
    // Si ya tenemos datos cargados, retornamos del cache
    if (this.isLoaded) {
      return new Observable((observer) => {
        observer.next({ cards: this.currentCards });
        observer.complete();
      });
    }

    // Si no hay datos, hacemos la petición HTTP
    return this.http
      .post<CardResponse>(
        `${this.API_URL}/card/get-cards`,
        {},
        { headers: new HttpHeaders().set('token', token) }
      )
      .pipe(
        tap((response) => {
          if (response?.cards) {
            this.cardsSubject.next(response.cards);
            this.isLoaded = true;
          }
        })
      );
  }

  createCard(
    token: string,
    data: { initialAmount: number; cardNumber?: string }
  ): Observable<CreateCardResponse> {
    return this.http
      .post<CreateCardResponse>(
        `${this.API_URL}/card/create`,
        data, // Enviamos el objeto completo
        { headers: new HttpHeaders().set('token', token) }
      )
      .pipe(
        tap((response) => {
          if (response.ok) {
            this.refreshCards(token).subscribe();
          }
        })
      );
  }

  getCardById(token: string, id: string): Observable<CardByIdResponse> {
    return this.http
      .post<CardByIdResponse>(
        `${this.API_URL}/card/get-card`,
        { id },
        { headers: new HttpHeaders().set('token', token) }
      )
      .pipe(
        tap((response) => {
          if (response.ok) {
            this.currentCardSubject.next(response.card);
          }
        })
      );
  }

  getHistory(token: string, id: string): Observable<HistorialResponse> {
    return this.http.post<HistorialResponse>(
      `${this.API_URL}/card/history`,
      { id },
      { headers: new HttpHeaders().set('token', token) }
    );
  }

  get currentCards(): Card[] {
    return this.cardsSubject.getValue();
  }

  createBatchCards(
    token: string,
    cardsData: { initialAmount: number; cardNumber?: string }[]
  ): Observable<CreateCardResponse> {
    return this.http
      .post<CreateCardResponse>(
        `${this.API_URL}/card/create`,
        { cards: cardsData }, // Enviamos el array dentro de un objeto con la propiedad 'cards'
        { headers: new HttpHeaders().set('token', token) }
      )
      .pipe(
        tap((response) => {
          if (response.ok) {
            this.refreshCards(token).subscribe();
          }
        })
      );
  }

  createTransaction(
    token: string,
    transactionData: CreateTransactionPayload
  ): Observable<TransationResponse> {
    return this.http
      .post<TransationResponse>(
        `${this.API_URL}/transaction/pay`,
        transactionData,
        { headers: new HttpHeaders().set('token', token) }
      )
      .pipe(
        tap((response) => {
          if (response.ok) {
            this.currentCardSubject.next(response.card);
            this.refreshCards(token).subscribe();
          }
        })
      );
  }

  deleteCard(token: string, id: string): Observable<DeleteCardResponse> {
    return this.http
      .delete<DeleteCardResponse>(`${this.API_URL}/card/delete`, {
        body: { id },
        headers: new HttpHeaders().set('token', token),
      })
      .pipe(
        tap((response) => {
          if (response.ok) {
            this.clearCurrentCard();
            this.refreshCards(token).subscribe();
          }
        })
      );
  }

  refreshCards(token: string): Observable<CardResponse> {
    this.isLoaded = false;
    return this.getCards(token);
  }

  addCardToList(card: Card) {
    const currentCards = this.currentCards;
    this.cardsSubject.next([...currentCards, card]);
  }

  clearCache(): void {
    this.cardsSubject.next([]);
    this.isLoaded = false;
  }

  get currentCard(): Card | null {
    return this.currentCardSubject.getValue();
  }

  clearCurrentCard(): void {
    this.currentCardSubject.next(null);
  }
}
