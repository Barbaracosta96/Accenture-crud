import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { EnderecoCep } from '../models/fornecedor.model'; // Reutilizando a interface

@Injectable({
  providedIn: 'root'
})
export class CepService {
  
  private readonly API_URL = 'https://cep.la'; // Usar HTTPS se disponível

  constructor(private http: HttpClient) { }

  consultarCep(cep: string): Observable<EnderecoCep | null> {
 
    const cepLimpo = cep.replace(/\D/g, '');

    if (cepLimpo.length !== 8) {
      console.error('CEP inválido:', cep);
      return of(null); 
    }

    const headers = new HttpHeaders({
        'Accept': 'application/json'
    });


    const url = `${this.API_URL}/${cepLimpo}`; 

    console.log(`Consultando CEP: ${url}`); 

    return this.http.get<EnderecoCep>(url, { headers }).pipe(
      tap(data => console.log('Resposta CEP:', data)), 
      catchError(error => {
        console.error(`Erro ao consultar CEP ${cepLimpo}:`, error);
        return of(null); 
      })
    );
  }

   isParana(uf: string | undefined): boolean {
    return uf?.toUpperCase() === 'PR';
  }
}