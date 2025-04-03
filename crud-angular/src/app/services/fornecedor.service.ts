import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, delay, first, tap } from 'rxjs';
import { Fornecedor } from '../models/fornecedor.model';

@Injectable({
  providedIn: 'root'
})
export class FornecedorService {

  private readonly API = '/api/fornecedores'; 

  constructor(private httpClient: HttpClient) { }

  list(filterNome?: string, filterCnpjCpf?: string): Observable<Fornecedor[]> {
    let params = new HttpParams();
    if (filterNome) {
      params = params.set('nome', filterNome);
    }
    if (filterCnpjCpf) {
      params = params.set('cnpjCpf', filterCnpjCpf);
    }

    return this.httpClient.get<Fornecedor[]>(this.API, { params })
      .pipe(
        first(),
  
        tap(fornecedores => console.log('Fornecedores recebidos:', fornecedores))
      );
  }

  loadById(id: number): Observable<Fornecedor> {
    return this.httpClient.get<Fornecedor>(`${this.API}/${id}`);
  }

  save(record: Partial<Fornecedor>): Observable<Fornecedor> {
    console.log('Salvando fornecedor:', record);
 
    if (record.tipoPessoa === 'PJ') {
        record.rg = undefined;
        record.dataNascimento = undefined;
    }

    if (record.id) {
      console.log('Atualizando fornecedor ID:', record.id);
      return this.update(record as Fornecedor);
    }
    console.log('Criando novo fornecedor');
    return this.create(record);
  }

  private create(record: Partial<Fornecedor>): Observable<Fornecedor> {
    return this.httpClient.post<Fornecedor>(this.API, record).pipe(first());
  }

  private update(record: Fornecedor): Observable<Fornecedor> {
    return this.httpClient.put<Fornecedor>(`${this.API}/${record.id}`, record).pipe(first());
  }

  remove(id: number): Observable<void> {
    return this.httpClient.delete<void>(`${this.API}/${id}`).pipe(first());
  }

  addEmpresaToFornecedor(fornecedorId: number, empresaId: number): Observable<any> {
    return this.httpClient.put<any>(`${this.API}/${fornecedorId}/empresas/${empresaId}`, {});
  }

  removeEmpresaFromFornecedor(fornecedorId: number, empresaId: number): Observable<any> {
    return this.httpClient.delete<any>(`${this.API}/${fornecedorId}/empresas/${empresaId}`);
  }
}